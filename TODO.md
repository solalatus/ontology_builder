# TODO — Knowledge Graph Canvas

Progress tracker for the project defined in `spec.md`. Keep this file up to
date as work happens: check items off, add notes under "Log / Decisions"
when something deviates from spec or gets clarified, and update "Current
State" so the project can be picked up cold at any time.

---

## Current State

- **Phase:** Phases 0 through 9 complete, all with green automated test
  suites (`node --test tests/*.spec.mjs`, 271 JS tests + 15 Python tests,
  see Log below). Not yet hand-tested on real touch hardware (pinch/
  long-press) — deferred to Phase 10, not blocking. Phase 7's real-folder
  grant/write-back is likewise only mocked-tested so far, not hand-verified
  on real Chrome/Windows or Chromium/Linux — also deferred to Phase 10.
  Phase 9's real-device 60fps feel is similarly only smoke-tested
  headlessly so far — also deferred to Phase 10. A "Clear" button, a
  dark/light theme toggle, editable node/edge labels (rename), parallel-
  edge bending, and Hungarian/English UI localization (all outside the
  phased plan, user-requested) were also added — see their own sections
  below, right after Phase 11.
  Phase 8's autolayout also now enforces explicit group-containment
  (members can't escape their group's box during layout), and Phase 2's
  group-drag has gone through two rounds of user-requested reversal: it
  now cascades absorption on drag-onto, and a group's own move is a
  rigid-body drag that carries its contents along (replacing the
  drag-away-releases-a-member behavior from the first round, which a
  rigid-body move makes physically unreachable) — group membership also
  now has its own visual hue, and a live group drag visually distinguishes
  move from resize. The rename field's inline input also had a positioning
  fix (anchors to the node/edge's own geometry, clamped to the viewport,
  instead of the raw click point) — see their own Log entries.
- **A user-requested "extensive visual and functional testing" pass**
  (not a new feature — pure QA) found and fixed 3 real, pre-existing bugs,
  all in the same corner: a second touch arriving to start a pinch-zoom
  while a different finger is already mid-drag could corrupt the drag,
  silently lose the in-progress position/size change from undo history, or
  leave a pending long-press-delete timer armed to fire on a node/edge the
  user had already moved past. See the dated Log entry and the "Multi-
  touch drag-interruption fixes" section (right after Hungarian/English
  localization) for the full account.
- **A follow-up "enhance the test suite" pass** (also pure QA/coverage,
  not a feature) found and fixed one more real, pre-existing bug while
  writing a new test: `updateGroupMembership()` could give a member a
  spurious *second*, direct membership in a bigger ancestor group when the
  group it was already nested in got dragged into that ancestor — see the
  Phase 2 section's own bullet and the dated Log entry.
- **A follow-up "implement the two highest-priority gaps from the plan,
  plus an end-to-end workflow test" pass** found and fixed the *same*
  redundant-ancestor bug's sibling in a different code path:
  `commitTxtImport()`'s `contains`-declaration handling had no equivalent
  guard at all (it doesn't call `updateGroupMembership()` — a TXT file
  establishes membership from declared text, not geometry). See the Phase
  6 section's own bullet and the dated Log entry. Also added the first
  deliberate exception to this suite's "one file per phase/feature"
  convention: `tests/end-to-end-workflow.spec.mjs`, a single long realistic
  session exercising many features together — see "Testing Strategy" and
  its own "Additional features" section, right after Multi-touch
  drag-interruption fixes.
- **A follow-up "implement all remaining high/medium priority tests from
  the plan" pass** closed out the rest of that same planning pass's
  findings — compounding Tier 1+2 storage failures, autolayout under
  adversarial graphs, parallel edges beyond 3, heterogeneous undo/redo
  stress, drag-interruption cost at 1,000 nodes, and rename-anchoring
  under a triple zoom+pan+membership combination. Unlike the rounds above,
  **no new bugs were found** — every one of these 9 new tests passed on
  the first real run, confirming the app's existing design already handles
  them correctly. See "Priority test-coverage completion" (right after the
  end-to-end workflow section) and the dated Log entry.
- **A dedicated test-hardening pass** (user-requested, ahead of Phase 10's
  manual testing) went back through every phase and added substantially
  more coverage (34 new tests, 159 → 193), and surfaced two real bugs in
  the process — both fixed, not just documented: (1) `setPointerCapture`/
  `releasePointerCapture` could throw uncaught (spec-documented, not
  hypothetical) and silently abort the rest of a pinch-gesture handler,
  meaning `pinchStartDist` might never get computed for that gesture; both
  calls are now wrapped defensively. (2) Panning the canvas (a drag
  starting on empty background) could silently clear whatever node/edge
  was currently selected, because the native `click` event that still
  fires after a pan's `mouseup` fell through to `clearSelection()` — pan
  drags past the move threshold now set `suppressNextClick` just like
  every other drag already does. See the dated Log entry below for full
  details on both and the per-phase test additions.
- **Target file:** `index.html` (single file, no external deps/CDN links).
  Dev-only test tooling lives in `tests/` and `tools/` (see `tests/README.md`)
  and never ships as part of the app.
- **Important deviation from spec, read before touching storage:** Tier 1
  is *not* OPFS-only as spec Section 3.2 literally says — it's OPFS with an
  automatic localStorage fallback, because OPFS throws `SecurityError`
  under a `file://` origin (confirmed by testing), which is exactly the
  deployment mode Section 2 promises ("opens directly in a browser...no
  external server required"). See the Phase 4 Log entry below for the full
  story and why this was a user decision, not a unilateral call.
- **spec.md's reference Python TXT loader (Appendix) had a bug, now fixed
  in spec.md itself.** As originally written, the generic `#`-comment skip
  ran before the `## NODES`/`## EDGES` header checks, and both headers also
  start with `#` — so the headers were unreachable and the reference loader
  parsed nothing, even against spec's own worked example. Found by testing
  (not inspection): the exact Python snippet, run against text extracted
  directly from spec.md, returned `([], [])`. **Unlike every other spec
  deviation in this project, spec.md was directly edited this time** — the
  user explicitly asked for spec/Python/JS to be brought into "one
  consistent state" rather than recording another delta in this file. A
  standalone, tested copy now lives at `tools/load_edge_list.py` (kept
  byte-identical to spec.md's snippet), with `tools/test_load_edge_list.py`
  (Python `unittest`) and `tests/python-parity.spec.mjs` (runs the Python
  script as a subprocess and diffs its output against the JS importer,
  proving agreement rather than asserting it). See the dated Log entry
  below for the full account, including a second, smaller behavioral
  change (malformed-line handling) made for the same consistency reason.
- **Next action:** Phase 10 (Cross-platform verification — the manual
  hands-on matrix that every deferred Tier-B item from Phases 0–9 above
  finally gets exercised against for real).

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
- **One deliberate exception to "one spec file per phase/feature":
  `tests/end-to-end-workflow.spec.mjs`.** Every other file verifies one
  feature or edge case in isolation; this file exists specifically to
  catch integration bugs that only surface when features interact across
  a real multi-step session — a rename anchoring correctly mid-group-
  membership, an undo landing back inside a since-resized group, a reload
  after a mix of theme/language/graph edits all persisting together. See
  its own section below (right after Multi-touch drag-interruption fixes)
  and the dated Log entry.

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
- Tests (`tests/phase0.spec.mjs`, 11 tests, all green — expanded from 5 in
  a later test-hardening pass, see the dated Log entry):
  - Automated: page loads with zero console/page errors and `camera` at
    identity; drag-pan, wheel-zoom (cursor over canvas), and the +/−
    buttons each change `window.__kg.camera` as expected; window resize
    keeps the canvas filling its container; `zoomAt` clamps to MIN_SCALE/
    MAX_SCALE regardless of how extreme the requested factor is; `zoomAt`
    keeps the exact world point under the cursor fixed; a zoom-in followed
    by its exact inverse factor returns to (very nearly) the original
    scale; a real two-finger pinch gesture (synthetic `pointerType: touch`
    events) zooms in/out via the same `zoomAt` mechanism as wheel/buttons
    — this is what surfaced the `setPointerCapture`/`releasePointerCapture`
    bug described in the Log below.
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
    deleting a node also clears its selection/toolbar. Expanded to 39
    tests in a later test-hardening pass: a new node is created centered
    on the click point; clicking a second node switches selection directly
    without deselecting first; a short click (no drag) on an edge selects
    it rather than deleting/ignoring it; the selection toolbar tracks a
    selected node's screen position across a pan; a very long label (500
    chars) doesn't crash rendering; a group node works as a Connect-mode
    endpoint just like an entity; two separate sequential drags on the
    same node both apply independently; selection survives an unrelated
    pan drag — this last one caught a real bug, see the Log entry below.
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
- [x] **Dragging the group itself now cascades membership too** (user-
      requested, later change — see the dated Log entry): dropping a group
      onto previously-unrelated nodes absorbs any it now fully contains.
      This *replaces* the original "moving a group never cascades"
      decision — resizing a group still never cascades, per Section 4.3's
      explicit language about that one specific case.
- [x] **A group's own move is now a rigid-body drag** (second reversal of
      the point above, later user-requested change — see the dated Log
      entry): every currently-contained member — recursively, including
      members of a nested member group — moves by the exact same delta as
      the group itself while it's being dragged, so its position *relative
      to the group* never changes. This makes "drag the group away until a
      member stops overlapping" physically unreachable through a group's
      own drag now (a member can still only ever be released by its own
      independent drag); absorbing previously-unrelated nodes the group's
      new position now covers is unaffected, since those nodes don't move.
      Resizing still never drags members or cascades membership, unchanged
      from the point above.
- [x] **Group membership now has a visual hue**: any non-group node
      currently listed in a group's membership renders with a distinct
      fill/stroke color (independent of selection), so which nodes belong
      to a group is visible at a glance rather than only inferable from
      nesting. A group being actively dragged also gets a live highlight
      that differs between a move (drags contents along) and a resize
      (never does), reverting to the normal look the instant the drag
      ends.
- [x] **`updateGroupMembership()` bugfix (found via a QA/test-coverage
      pass, not a feature): a candidate group that's just a bigger ancestor
      of a group the node is already a member of is now skipped**, instead
      of being added as a second, redundant, direct membership. Without
      this, dragging a group that already has its own nested member into a
      bigger *outer* group gave that member a spurious second, direct
      membership in the outer group too (plus a spurious second `contains`
      edge) — a member of Inner-inside-Outer should be "in Outer" only
      through nesting, never through a separate direct edge as well. The
      fix only skips a candidate that fully contains one of the node's
      *existing* memberships — the legitimate "member of two separate,
      merely-overlapping, same-level groups" case (below) is unaffected,
      since neither of those groups contains the other.
- Tests (`tests/phase2.spec.mjs`, 23 tests, all green — rewritten in the
  rigid-body-move change: two tests that asserted the old "drag away
  releases a member" behavior now assert the opposite — the member travels
  with the group — since that behavior is what replaced it; on top of the
  earlier test-hardening pass's additions: deleting a grandparent group
  only cleans up its direct child, a deeper grandchild membership is
  untouched; dragging a node from deep inside a nested group to just
  outside it, but still inside the outer group, reassigns membership from
  inner to outer in one drag; long-pressing a group node (with a member)
  deletes it and cleans up membership/the contains edge the same way
  keyboard Delete already does. A new `tests/group-move.spec.mjs`, 11
  tests, covers the rigid-body-move mechanics, the visual hue/highlight,
  and the redundant-ancestor-membership fix in depth):
  - Automated (`phase2.spec.mjs`): "Add Group" creates a `type:"group"`
    node with the Section 4.3 defaults (320×220, `boundary_mode:"manual"`,
    empty `groups[]`), is one-shot, and Escape-cancelable, mirroring Add
    Node. Dragging a smaller node fully into a group commits `groups[]` +
    creates exactly one `auto:true` `contains` edge; creating a node
    directly inside a group's boundary (no drag) does *not* auto-join; a
    drop that only *partially* overlaps neither commits a new membership
    nor removes an existing one; dragging a member fully outside removes
    membership + the edge; the resize-corner handle changes w/h by the
    exact drag delta and clamps at a minimum size, and resizing still
    never cascades membership; recursive nesting (a shrunk group dragged
    into a bigger one, then an entity dragged into that inner group) joins
    only the *innermost* container, never also the outer one; overlapping
    membership (one node in two separate groups) works via two sequential
    drags, with equal-area ties broken deterministically by creation
    order; deleting a group clears the field from any (former) member's
    `groups[]` and removes the edge; deleting a member leaves the group
    intact; a `contains` edge is never selectable by clicking near it (the
    click resolves to a node); hit-testing always picks the
    smallest/topmost box under the cursor regardless of which node was
    created first. **Group-drag, rigid-body**: dragging a group far away
    keeps a contained member fully intact instead of releasing it; nudging
    a group by a small delta carries a member by that exact same delta,
    proven via position deltas, not just the membership-array outcome;
    dragging a group onto a new node absorbs it while an existing member
    (carried along in the same drag) keeps its own membership, all in one
    undo step, and undo restores the member's *exact* prior position
    (`deepEqual` against the pre-drag snapshot, not just its `groups[]`).
  - Automated (`group-move.spec.mjs`): a group drag moves every contained
    member by the exact same delta, membership surviving intact; a resize
    drag never moves a member, even by one pixel; a member nested two
    levels deep (member of an inner group, itself a member of an outer
    group) moves when the *outer* group is dragged; the whole move+cascade
    is exactly one undo step and undo restores every member's exact prior
    position; dragging a group onto a previously-unrelated node still
    absorbs it while existing members are carried along, in one drag. For
    the visual hue: a node's rendered fill pixel actually changes (sampled
    via `getImageData`, not inferred) the moment it becomes a member and
    reverts the moment it's dragged back out; `window.__kg.getNodeVisualState()`
    (a new test hook mirroring `drawNodes()`'s exact color-selection logic)
    reports `isMember` correctly for a member, a non-member, and the group
    itself (never true for the group); mid-drag, a group being moved
    reports `isBeingMoved` (never `isBeingResized`) and a group being
    resized reports the reverse, both clearing the instant the drag ends,
    and a resize is proven to never move the group's own x/y even by one
    pixel while the highlight is active. **Redundant-ancestor-membership
    fix**: dragging a small group (with its own nested member) into a
    bigger outer group absorbs the small group as the outer group's member
    while the nested member travels along with its own (immediate) parent
    — and the nested member's `groups[]` stays exactly `[innerGroupId]`,
    never gaining a second, direct `[outerGroupId]` entry too (this is the
    regression test for the bug above — it fails without the fix); a node
    that's a member of two separate, merely-overlapping (not nested)
    groups still correctly keeps both memberships when only one of the two
    is dragged, and correctly loses the *stationary* one it no longer
    overlaps — proving the fix didn't overcorrect into blocking the
    legitimate multi-membership case.
  - Manual: visual nesting reads correctly across zoom levels (spot-checked
    via screenshots this session, not exhaustively at every zoom level);
    confirm no arrow is ever drawn on canvas for a `contains` edge (also
    confirmed via screenshot); the membership hue and move/resize
    highlights were spot-checked via screenshots this session too (member
    node green-tinted fill+stroke, group border violet while moving, cyan
    while resizing).

## Phase 3 — Undo/redo

- [x] Command-pattern undo stack in memory
- [x] Every discrete action = one undo step: add, move, connect, delete,
      group, autolayout, TXT import (autolayout/TXT import don't exist yet
      — Phases 8/6 — so only add/move/connect/delete/group are wired so
      far; the history mechanism itself is generic and ready for them)
- [x] Undo/Redo buttons only, no dedicated gesture — Decision #8
- [x] Confirm: undo stack NOT persisted across reload (reload starts fresh
      from last saved state) — Section 8
- Tests (`tests/phase3.spec.mjs`, 20 tests, all green — expanded from 16 in
  a later test-hardening pass: a 20-step chain fully undoes to empty and
  fully redoes back, in order; undo/redo always clear the current
  selection rather than trying to restore it; alternating undo/redo cycles
  land on exactly the right state at every intermediate step, not just at
  the ends; undoing an Auto-layout after several unrelated prior actions
  only reverts the layout):
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

- [x] Every edit writes immediately to OPFS in background (add/move/connect/
      group/delete) — no prompts, no visible file (**+ localStorage
      fallback for `file://` contexts where OPFS is unusable — see Current
      State and Log below**)
- [x] On load: restore from OPFS if present (crash/dropped-tab recovery)
- [x] Verify this works on all 4 target combos (OPFS is universally
      supported per Section 3.1 capability matrix) — **partially**: verified
      programmatically in headless Chromium for both the served (OPFS) and
      `file://` (localStorage fallback) cases; the 4-platform hardware pass
      is still Phase 10's job.
- Tests (`tests/phase4.spec.mjs`, 16 tests, all green — expanded from 11 in
  a later test-hardening pass: a burst of many scheduled saves coalesces
  into far fewer than N actual writes, proven via a counted
  `localStorage.setItem` wrapper, not just inferred; a moderately large
  graph (50 nodes, ~30 edges, nested groups) round-trips exactly; Clear
  does not touch the separately-stored theme preference; a later QA/test-
  coverage pass added a `localStorage.setItem` *write*-failure test — a
  different failure mode than the existing corrupted-payload-on-*load*
  test above it; a still-later pass added the equivalent for the *other*
  live backend, OPFS):
  - Automated: `window.__kg.storage.detectBackend()` resolves to
    `"localStorage"` under `file://` and to `"opfs"` when served over
    http (a real local static server is spun up in-test —
    `tests/lib/server.mjs` — specifically to exercise the OPFS path for
    real, not just the fallback); an edit schedules a save and, once
    `storage.whenIdle()` resolves, the payload is actually present in the
    backing store; reloading restores nodes/edges *and* group membership
    (`groups[]` + the auto `contains` edge) correctly in both backends; id
    counters are restored too, so a node added post-reload never collides
    with a restored id; the state persisted is whatever's current *after*
    an Undo, not the undone version; a fresh profile with nothing saved
    boots to a normal empty graph; a corrupted saved payload is caught and
    ignored (boots empty, no crash, no console error) via `page.addInitScript`
    seeding garbage JSON before the app's own boot script runs; camera pan/
    zoom and selection are deliberately *not* restored (only graph data is
    — consistent with Phase 3 already not persisting the undo stack). A
    `localStorage.setItem` *write* throwing (e.g. `QuotaExceededError`,
    simulated by monkey-patching it mid-test) is caught rather than
    crashing the app — the in-memory edit itself survives, `whenIdle()`
    still resolves instead of hanging forever inside the write's own
    `await`, and a later successful save (once the failure is lifted)
    persists correctly, proving the failure doesn't wedge the save loop
    for good. The same is proven for OPFS specifically (served over http,
    `navigator.storage.getDirectory()` made to throw only for the *write*
    call — backend detection itself, already cached from an earlier
    settled save, is untouched): the in-memory edit survives, `whenIdle()`
    resolves, backend detection still reports `"opfs"`, and a subsequent
    save/reload round-trips the current state correctly.
  - Manual: the actual 4-platform matrix (Chrome/Windows, Chromium/Linux,
    Brave/Linux, Chrome/Android) — deferred to Phase 10 as originally
    planned; what's new is that Phase 10 must now also confirm which
    backend each platform/deployment-mode combination actually lands on.

## Phase 5 — File formats (export)

- [x] JSON canonical export exactly per Section 5.1 schema (meta, nodes,
      edges — full fidelity incl. positions/sizes/group boundaries)
- [x] TXT edge-list export exactly per Section 5.2 grammar (`## NODES`,
      `## EDGES`, `->` / `<->`, `[group]` suffix, comment header)
- [x] Versioned filename convention (Section 5.4):
      `<graph-name>_v<0000>_<UTC-timestamp>.{json,txt}` — both written
      together on every "Save Version"
- [x] Version number increments monotonically, stored in graph metadata,
      continuous across sessions
- Tests (`tests/phase5.spec.mjs`, 21 tests, all green — expanded from 17 in
  a later test-hardening pass: unicode/special characters in labels and
  relations survive both JSON and TXT export intact; a 3-level-deep
  nested-groups `groups[]` chain exports correctly; undoing an unrelated
  action never resets or perturbs the version counter on the next save;
  TXT export lists nodes and edges in creation order):
  - Automated: intercepts real browser downloads via `page.on('download')`
    (not `Promise.all` on two `waitForEvent` calls — that pairing turned
    out unreliable for two downloads fired synchronously from one click;
    see Log). The graph title defaults to "Untitled Graph" and is visible
    with zero prior action; clicking it opens a rename field pre-filled
    with the current name, Enter/Space on the focused title does the same
    (keyboard access), Escape cancels without changing anything, an empty/
    whitespace commit reverts to "Untitled Graph" rather than going blank,
    and a renamed title survives a reload; Save Version never blocks on a
    prompt — it always fires immediately using whatever the title
    currently is; exactly two downloads are written per save, named per
    the `<graph-name>_v<0000>_<timestamp>` convention; the *filename* is
    sanitized for safety while the *displayed* title keeps the raw,
    human-entered form (only sanitized at save time, not at rename time);
    the JSON output round-trips through `JSON.parse` and matches Section
    5.1's schema field-for-field (including `boundary_mode` only on
    groups, `groups[]`/positions surviving intact, and confirming
    `graph_name` is *not* part of the canonical `meta` object — it's
    filename-only) against a fixture with a group, a member, and an
    ordinary edge; the TXT output matches Section 5.2's grammar
    line-for-line against the same fixture, *including* the `contains`
    line (unlike canvas rendering and Tier 1 storage, the TXT export
    deliberately does not filter out `auto` edges — Section 5.2 says so
    explicitly); a bidirectional edge exports with `<->`; saving twice
    increments the version monotonically in both the filename and the
    JSON `meta.version`; `graph_id`, `version`, and the renamed title all
    survive a reload and `version` keeps incrementing rather than
    resetting; neither Save Version nor renaming the title creates an
    undo step; an empty graph still exports valid, structurally-correct
    empty output.
  - Manual: confirm the files actually land on disk via the real
    browser-native save/download flow (Tier 3 baseline) — not exercised
    here since Playwright intercepts the download event before any actual
    disk write; that's a genuine gap only real manual use can close.

## Phase 6 — TXT import (Section 5.3)

- [x] Reference Python-style loader logic ported to JS (parse `## NODES` /
      `## EDGES`, `[group]`, `->` vs `<->`) — **with a bug fix**, applied to
      *both* the JS port and spec.md's own Appendix snippet: the original
      check order made the section headers unreachable. Standalone tested
      copy at `tools/load_edge_list.py`. See Log.
- [x] Merge mode (default): label+type matched; new nodes created and
      auto-placed (shelf/grid, flagged as new); existing nodes keep
      position/size/groups untouched; new edges added; missing edges left
      alone (never deleted); `X -> Y : contains` lines interpreted as group
      membership, not literal edges
- [x] Replace mode: same diff, but removes nodes/edges absent from TXT;
      requires confirmation step showing diff summary (N added/removed/
      unchanged); one undo step regardless of size
- [x] Triggered via "Import from TXT" button (native file-open dialog) and
      drag-and-drop of `.txt` onto canvas where supported
- [x] **Contains-declaration redundant-ancestor guard** (bugfix, found via a
      QA/test-coverage pass, not a feature): applying `X -> Y : contains`
      lines now skips a declaration that's just a bigger ancestor of a
      group `Y` is already (declared or previously) nested in — the same
      guard `updateGroupMembership()` (the drag-based path) already has,
      applied through a different mechanism since TXT import establishes
      membership from declared text, not geometry. Without this, a file
      declaring both `Outer -> Leaf : contains` and
      `Inner -> Leaf : contains` (with Inner itself nested in Outer) gave
      Leaf a spurious second, direct membership in Outer on top of its
      real one in Inner, plus a redundant second `contains` edge. The
      check is computed from the *complete* set of this file's (and any
      pre-existing) group-to-group nesting before any declaration is
      applied, so the result never depends on which order the `## EDGES`
      lines happen to appear in.
- Tests (`tests/phase6.spec.mjs`, 25 tests + 5 fixture files under
  `tests/fixtures/`, all green — expanded from 17 in a later test-hardening
  pass: a file with only groups declared and no `## EDGES` section at all
  imports cleanly; blank lines/trailing whitespace throughout don't break
  parsing; merging a file that references a node previously deleted from
  the current graph re-creates it fresh (matching is against the live
  graph, not import history); merge adds a new member to an already-
  existing group via a `contains` line; a ~200-node import completes
  without hanging; 3 more added for the redundant-ancestor guard: a leaf
  declared as a member of both an inner and its outer ancestor group keeps
  only the real, innermost membership (no redundant edge either); the same
  file produces an identical result regardless of which order its
  `contains` lines appear in; a leaf declared as a member of two genuinely
  separate, non-nested groups still gets both — proving the guard doesn't
  overcorrect into blocking legitimate overlapping membership):
  - Automated: Merge on an empty graph reproduces spec's own worked example
    exactly (nodes, types, groups, directed flags, the auto `contains`
    edge); merge is idempotent (re-importing the same file adds nothing,
    creates no duplicates); an existing node's position/size/groups survive
    a merge untouched (matched purely by label+type, confirmed by moving
    it first and checking coordinates after); merge never deletes an edge
    absent from the TXT; newly-created nodes are shelf/grid-placed below
    existing content, never full autolayout; new nodes are flagged
    (`getNewlyImportedIds()`) until the *next* discrete action clears the
    flag; the Replace button is hidden when the graph is already empty
    (nothing to remove, so nothing to confirm); the dialog's diff-summary
    counts are asserted to match what committing actually produces, not
    just eyeballed; Replace removes graph-only nodes/edges in exactly one
    undo step, fully reversible; Replace preserves a surviving node's
    position while pruning group membership the new TXT doesn't redeclare
    (and removing the now-orphaned `contains` edge); Cancel and clicking
    the dialog backdrop both apply nothing; label matching is confirmed
    case-sensitive; matching requires label *and* type (same label,
    different type, creates a second distinct node); malformed edge lines
    (no connector, no `" : "` separator) are skipped without crashing;
    drag-and-drop onto the canvas (via a synthetic `DragEvent`+
    `DataTransfer`, since Playwright can't drag a real OS file) opens the
    same dialog as the file picker; an import triggers a background save
    and survives a reload.
  - Manual: the native file-open dialog chrome itself, and a real OS-level
    drag-and-drop (synthetic `DragEvent` in tests exercises the app's drop
    handler correctly but isn't a full substitute for an actual file being
    dragged from a real file manager) — both deferred to Phase 10.
  - **Python reference loader** (`tools/load_edge_list.py`, kept
    byte-identical to spec.md's Appendix snippet): `tools/test_load_edge_list.py`
    (15 tests, `unittest`, stdlib only) covers the same shared
    `tests/fixtures/*.txt` files — full reproduction of spec's worked
    example (including that the fix actually works — one test pins down
    exactly the "headers swallowed by the comment check" regression),
    group-suffix stripping, bidirectional edges, comments/blank lines
    ignored, both classes of malformed edge line skipped, a bare `[group]`
    marker with no name skipped, a file with no recognized sections
    returning empty, and multiple edges between the same pair. Separately,
    `tests/python-parity.spec.mjs` (4 tests, part of the JS suite) runs the
    Python script as a subprocess against every fixture and diffs its
    output against the JS importer's `parseTxtImport()` directly — proof
    the two agree, not just a comment claiming they do. Skips gracefully
    (console warning, not a failure) if `python3` isn't on `PATH`.
    Run both: `node --test tests/*.spec.mjs && python3 -m unittest
    discover -s tools -p "test_*.py"`.

## Phase 7 — Tier 2 storage (live folder sync, progressive enhancement)

- [x] Feature-detect `showDirectoryPicker` — offer opt-in only on Chrome/
      Windows and Chromium/Linux (NOT Brave, NOT Android — Section 3.1)
- [x] On grant, explicit saves write silently into chosen folder, no further
      prompts
- [x] Confirm app is fully functional with Tier 2 entirely absent (Brave/
      Android path never blocked)
- Tests (`tests/phase7.spec.mjs`, 8 tests):
  - Automated: turns out headless Chromium *does* expose
    `showDirectoryPicker` (the property exists regardless of user-gesture
    grant), so real end-to-end coverage was possible, not just branch
    coverage — `window.showDirectoryPicker` is mocked via Playwright's
    `addInitScript` (installed before `index.html`'s own scripts run, since
    `boot()` feature-detects synchronously at load) to grant a fake
    directory handle and record writes in-memory. Covers: button hidden
    when the API is deleted from `window` (Brave/Android simulation) and
    the app still runs error-free; button revealed + correct initial state
    when the API is present; successful grant updates button text/
    `aria-pressed`; a cancelled picker (`AbortError`) leaves Tier 2
    disconnected with no console error; a connected Save Version writes
    exactly two files into the mock folder (correct versioned filenames,
    valid JSON content) and triggers **zero** browser downloads; a write
    failure *after* grant falls back to the normal two-download Tier 3
    path rather than silently losing the save; Save Version without ever
    connecting behaves exactly like the pre-Phase-7 baseline; the
    `window.__kg.tier2.setDirHandle()` test hook drives the same button
    state as a real grant.
  - Manual (still required — this phase is fundamentally about real OS
    interaction, and headless mocking can't prove the real native picker
    dialog or real filesystem writes work): actual folder grant + silent
    write-back on Chrome/Windows and Chromium/Linux; confirm Brave/Linux
    and Chrome/Android never even offer Tier 2. **Not yet done** — flagged
    in Current State.

## Phase 8 — Autolayout

- [x] Explicit "Auto-layout" button only, never automatic (Section 2, 8)
- [x] Algorithm: implementation detail, not fixed by spec (force-directed /
      hierarchical / grid — pick one, document choice in Log below)
- [x] Single undo step regardless of node count (one "before" snapshot of
      all positions)
- [x] Group boundaries are non-penetrable by their members during
      autolayout (user-requested hardening, beyond the original Phase 8
      plan — see Log below): a member is clamped strictly inside every
      group it belongs to on every iteration, including nested groups
      (member → inner group → outer group), overriding the physics
      simulation rather than just relying on the soft "contains" edge pull.
- Tests (`tests/phase8.spec.mjs`, 10 tests, expanded from 9 in a later
  test-hardening pass: a node belonging to two separate overlapping groups
  stays contained in both simultaneously during layout):
  - Automated: no-op (no history entry, no movement) on an empty or
    single-node graph; on a small connected graph, positions change and
    it's exactly one undo step (one Undo restores every node's exact
    pre-layout position, one Redo re-applies the exact same result); only
    `x`/`y` change — ids, labels, edge list, and group `groups[]`
    membership are byte-identical before/after; doesn't crash or hang on
    disconnected components and a floating group with no edges at all
    (asserted via a wall-clock bound plus `Number.isFinite` on every
    resulting position); a reload never silently re-lays-out the graph
    (confirms "never automatic" isn't just a UI claim); a member stays
    fully inside its group's box even when a strong edge pulls it toward a
    far-away node (proves the clamp is a hard override, not a coincidence
    of the soft attraction); every member of a multi-member group stays
    contained simultaneously; nested containment holds (member inside
    inner group, inner group inside outer group); a member deliberately
    bigger than its (tiny) group doesn't crash or produce non-finite
    positions (best-effort clamp on an already-possible pre-existing edge
    case, not something autolayout itself creates).
  - Manual: visually sane result (no total node overlap) on a real fixture
    graph — layout aesthetics aren't something to assert numerically. Spot-
    checked headlessly with a 12-node/11-edge chain graph (mixed entity/
    group types): nodes spread into a readable line with no overlaps and
    no `NaN`/`Infinity` positions — see Log entry below. **Not yet done on
    a real device/browser** — deferred to Phase 10 alongside the other
    hands-on checks.

## Phase 9 — Scale & performance

- [x] Viewport culling (draw/hit-test only what intersects visible camera
      rect) — Section 6
- [x] Verify smooth 60fps drag/pan/zoom at ~1,000 synthetic nodes (frame-time
      smoke check — see Tests below; not measured on a real device yet)
- [x] Confirm disconnected components / floating groups behave identically
      to connected graphs under pan/zoom/culling
- Tests (`tests/phase9.spec.mjs`, 7 tests, expanded from 6 in a later
  test-hardening pass: a group's resize handle remains draggable after
  panning/zooming the camera, proving hit-test culling doesn't break it):
  - Automated: seeded 1,000 synthetic nodes via `window.__kg.actions`
    (bypassing the UI for setup speed). Zooming into a small region draws
    far fewer than the full 1,000 (culling actually shrinks the drawn set,
    checked via an exposed `renderStats` counter — Section 9's plan
    suggested either a counter or timing comparison; the counter was
    chosen since it's exact and immune to CI timing noise); zooming out to
    fit the whole graph draws nearly all 1,000 back (culling isn't
    silently losing anything); `render()` stays under a generous 100ms/
    frame budget even in the worst case of (nearly) all 1,000 nodes
    actually drawn (a smoke check on the shape of the perf characteristic,
    per the original plan, not a strict CI gate); a scattered mix of
    connected pairs, isolated singletons, and a floating group across a
    huge world are culled by an exact position-only check (drawn count
    matches an independently-computed geometric overlap against the
    exposed visible-world-rect, regardless of connectivity or node type —
    directly proves the "behave identically" requirement rather than just
    asserting it); a node that's actually on screen after zooming in still
    selects correctly on click (culling doesn't silently break real hit-
    testing); an edge whose both endpoints are off-screen but whose
    segment's bounding box crosses the viewport is still drawn (culling by
    endpoint bounding box, not "is either endpoint visible").
  - Manual: real-device feel (Chrome/Android in particular) with a large
    graph — headless timing doesn't substitute for actually dragging it.
    **Not yet done** — deferred to Phase 10 alongside the other hands-on
    checks.

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

## Additional features (outside the phased plan)

Features requested directly by the user that don't map onto any spec.md
phase above — tracked here instead of invented as a fake phase number.

### Clear graph

- [x] "Clear" toolbar button, disabled when the graph is already empty
- [x] Confirms via a centered modal dialog (not native `confirm()`, for the
      same reason as the inline text input — consistent styling, DOM-
      testable) before doing anything destructive; Cancel, clicking the
      backdrop, or Escape all back out with zero effect; Enter or the
      dialog's own confirm button proceed
- [x] Empties `state.nodes` and `state.edges` in one action
- [x] Undoable: routed through the same `pushHistory()` mechanism as every
      other action (Phase 3), so it's exactly one undo step and Undo
      restores the graph exactly as it was
- [x] Persisted like any other edit: goes through `pushHistory()`, which
      already triggers `scheduleSave()` (Phase 4), so a cleared graph is
      what a reload restores — not the pre-clear one
- Tests (`tests/clear-graph.spec.mjs`, 12 tests, all green): button
  disabled/enabled state tracks whether the graph is empty; opening the
  dialog doesn't clear anything by itself; Cancel, backdrop-click, and
  Escape all leave the graph untouched and close the dialog; Enter and the
  confirm button both clear it; clearing removes nodes, edges, and group
  membership together; Escape while the dialog is open closes only the
  dialog and doesn't also cancel an unrelated armed mode (e.g. Add Group)
  underneath it; Clear is exactly one undo step and Undo/Redo round-trip
  it correctly; a genuinely disabled Clear button can't be clicked at all;
  the post-clear (empty) state is what survives a reload, not the old one.

### Dark/light theme toggle

- [x] Explicit "Theme: Dark" / "Theme: Light" toolbar button — status label,
      not a command, and `aria-pressed` reflects whether light is active
- [x] Defaults to dark (the app's original, only-ever look), never follows
      `prefers-color-scheme` — a manual toggle should override the OS
      setting, not silently follow it
- [x] Covers both the CSS-driven toolbar/dialog chrome and the Canvas2D-
      drawn graph itself (node/edge/group colors) — a real second theme,
      not just a toolbar recolor
- [x] Persisted in its own `localStorage` key (`kg-theme`), independent of
      the graph's own Tier 1 payload — a UI preference, not graph data;
      survives Clear/import/reload unaffected by any of that
- [x] Applied synchronously at top-level script scope (before `boot()`,
      before first paint) — no dark-then-light flash on load
- Tests (`tests/theme.spec.mjs`, 6 tests, all green): defaults to dark on a
  fresh load with no prior `localStorage`; clicking the toggle flips
  `<html data-theme>`, the button label, and `aria-pressed` both ways;
  toggling actually repaints the canvas (a node's fill pixel, sampled away
  from its label text, changes color between themes — proves the change
  reaches Canvas2D draw calls, not just DOM/CSS); the choice survives a
  reload; toggling never pushes an undo/redo history entry (it's a display
  preference, not a graph edit); the `window.__kg.theme` test hook mirrors
  the button.

### Editable node/edge labels (rename)

- [x] Double-click an existing node on desktop opens an inline rename
      field pre-filled with its current label (or an existing edge, near
      its line, pre-filled with its current relation) — reuses the exact
      `showInlineInput()` pattern creation already uses
- [x] Floating selection toolbar gained a rename button (pencil icon),
      visible for both node and edge selections — the touch-friendly
      equivalent, since there's no reliable double-tap distinct from a
      fast double-select on touch devices
- [x] Empty or unchanged submission is a no-op: no history entry, matching
      how an empty label at creation time creates nothing
- [x] Exactly one undo step per rename, fully reversible
- [x] **Positioning fix (later, user-requested — "pops up at funky places,
      distant from the node")**: the rename field now always anchors to
      the node/edge's own current geometry (node center; edge's actual
      curve midpoint) computed fresh via `worldToScreen()`, never to the
      raw click/tap coordinate that triggered it. The raw-click approach
      could land the field far from a node's own rendered label — e.g.
      double-clicking near a corner of a large or heavily-zoomed node — for
      no reason a user would expect. `beginRenameNodePrompt`/
      `beginRenameEdgePrompt` no longer take a `screenPos` parameter at
      all; they compute their own anchor, so double-click and the
      selection-toolbar's rename button (which already anchored to model
      geometry) are now provably consistent instead of coincidentally
      similar. Separately, `showInlineInput()` now clamps the field's
      *center* to stay inside the viewport and below the toolbar overlay
      (`clampCenterToViewport()`), re-measured against the field's real
      laid-out size once it's in the DOM — so a node dragged close to a
      screen edge no longer produces a rename field that's partly
      off-screen or rendered underneath the toolbar.
- Tests (`tests/rename.spec.mjs`, 16 tests, all green — expanded from 10 in
  the positioning fix): double-click opens a rename field pre-filled with
  the current label and commits correctly; Escape cancels without changing
  anything; an unchanged or blank submission pushes no undo step; renaming
  is exactly one undo step and fully reversible; a group node uses the
  group placeholder and renames identically to an entity; double-clicking
  an edge (on its line) opens a rename field pre-filled with the relation
  and commits correctly; edge renaming is also exactly one undo step; the
  selection toolbar's rename button opens the same prompt as double-click;
  that button is visible for both node and edge selections (unlike the
  direction-toggle, which is edge-only); a renamed label/relation survives
  a reload like any other edit. **Positioning**: double-clicking near a
  large group's corner (far from its center) still anchors the field to
  the node's center, not the click point; the anchor tracks the node
  through a zoom+pan, matching `worldToScreen(center)` to sub-pixel
  precision, even when the double-click itself lands near an edge of the
  (now large) node; double-clicking near a bent edge's source endpoint
  (deliberately far from its midpoint, using a real two-edge parallel-bend
  pair so the midpoint is off the straight line) still anchors to the
  curve's actual midpoint; a field near the top of the viewport clamps
  below the toolbar rather than rendering underneath it; a field near the
  right/bottom edge clamps fully on-screen; the selection-toolbar's rename
  button is unaffected by *where* the node was clicked to select it, since
  it never used click position to begin with.

### Parallel edge bending

- [x] When 2+ (non-`auto`) edges connect the same unordered node pair,
      each bends into a quadratic curve, offset perpendicular to the
      straight line by a multiple of a fixed step, symmetric around zero
      (e.g. 3 edges bend at -1, 0, +1 steps) — a lone edge between a pair
      is completely unaffected (bend 0 == straight, the common case)
- [x] Endpoints stay exactly where a straight edge's anchors would be
      (node-border-clipped, unchanged) — only the path between them bends
- [x] Arrowhead follows the curve's actual tangent at the endpoint, not
      the straight a→b direction
- [x] Hit-testing (`findEdgeAt`) and viewport culling (`edgeBoundingRect`)
      are both bend-aware: a bent edge is hit-tested by sampling its
      actual curve, and culled by a bounding box that includes the control
      point (a quadratic bezier is always within the convex hull of its
      three control points, so this can never wrongly exclude the curve)
- Tests (`tests/parallel-edges.spec.mjs`, 8 tests, all green): a lone edge
  between a pair never bends; two edges bend to opposite sides by equal,
  non-zero, perpendicular amounts; three edges bend symmetrically with the
  middle one staying exactly on the straight line; an `auto` (contains)
  edge never counts toward a pair's bend group; hit-testing resolves each
  bent edge to its own curve rather than always the first one; double-
  clicking one bent curve renames that specific edge, not its sibling;
  viewport culling accounts for a curve's bulge beyond its straight-line
  bounding box; two edges pointing in opposite directions (A→B and B→A)
  between the same pair still fan out distinctly rather than mirroring
  onto the same curve — this last one caught a real bug, see the Log entry
  below.

### Hungarian/English localization

- [x] All UI *chrome* text (toolbar button labels/aria-labels, tooltips,
      placeholders, dialog messages, the canvas empty-state message, the
      page `<title>`) is localized into Hungarian and English via a small
      `STRINGS = { en: {...}, hu: {...} }` dictionary and a `t(key, ...args)`
      lookup — dynamic entries are functions (interpolated at call time),
      static entries are plain strings
- [x] A "Nyelv: Magyar" / "Language: English" toolbar button toggles
      between them, mirroring the existing theme-toggle button's
      status-label convention (`aria-pressed` reflects English being
      active)
- [x] Defaults to Hungarian on first load, persisted in its own
      `localStorage` key (`kg-lang`), applied synchronously at top-level
      script scope (before `boot()`, before first paint) — same
      no-flash-of-wrong-language pattern the theme toggle already
      established
- [x] **Explicitly does NOT translate user-created graph content** — node
      labels, edge relations, and a graph's name once the user has
      actually renamed it are user data, not application interface, and
      auto-translating them would corrupt what the user actually typed.
      The one exception: an *untouched* "Untitled Graph"/"Névtelen gráf"
      placeholder title (never renamed) tracks the current language on
      toggle, since it's the app's own default text, not something the
      user wrote — see the Log entry below for how this is detected
      without ever risking a real user-chosen name.
- [x] Toggling language is not an undoable graph action (never touches the
      undo/redo stack), exactly like the theme toggle
- Tests (`tests/localization.spec.mjs`, 14 tests, all green): defaults to
  Hungarian with no prior `localStorage`; toggling flips every static
  button/tooltip/aria-label and the `<html lang>` attribute, and flips
  back; the choice persists across a reload; toggling pushes no undo/redo
  entry; the `window.__kg.lang` test hook mirrors the button; an untouched
  "Untitled Graph" placeholder retranslates on toggle, but a graph the
  user has actually renamed never does; the canvas empty-state message and
  the node/group/relation inline-input placeholders translate in both
  languages; the Clear confirm dialog's message and button labels
  translate; the import dialog's diff-summary message translates with
  correctly interpolated node/edge counts, and its Cancel/Replace/Merge
  button labels translate; the selection toolbar's Rename/Delete tooltips
  translate.

### Multi-touch drag-interruption fixes (QA pass, no new user-facing feature)

User-requested "extensive visual and functional testing" pass, not a
feature request — found and fixed 3 related bugs, all pre-existing (not
introduced by any earlier phase or additional feature in this project,
just never previously exercised by a test), all in the same corner:
what happens when a second touch arrives to start a pinch-zoom while a
different finger is already mid-drag.

- [x] **Interrupting a drag no longer strands the position/size change
      outside undo history.** Previously, a pinch starting mid-drag (or a
      genuine browser `pointercancel`) just nulled `dragMode` and friends
      directly — whatever had already moved/resized stayed mutated in
      `state`, but `pushHistory()` was never called, so the change was
      both un-undoable and invisible to the next save. New
      `abortActiveDrag()` commits whatever changed so far exactly like an
      ordinary drag release would (including the group-move member
      cascade and membership recompute), and is a genuine no-op — no empty
      undo step — if nothing had moved yet. Both interruption sites (pinch
      start, `pointercancel`) now call it.
- [x] **A second pointer's own `pointerdown` could hijack an already-active
      drag from a different pointer.** The main pointerdown handler had no
      concept of "an interaction is already in progress" — a second
      touch's pointerdown reached it *before* the pinch-recognition logic
      (a separate listener) ever ran, and its own hit-test could reassign
      `dragMode`/`movingNodeId`/`panPointerId` out from under the first
      pointer's still-active drag. A new `activePointerId` variable tracks
      which pointer owns the current interaction; pointerdown now ignores
      any other pointer while one is active, and pointermove/pointerup
      guard on it too (mirroring the `pan` mode's pre-existing
      `panPointerId` check, generalized to every drag mode).
- [x] **A pinch starting no longer leaves a pending long-press-delete timer
      armed.** The 600ms long-press timer (started on pointerdown, meant to
      be cleared by whichever pointerup/pointercancel ends that same
      press) wasn't cleared by a pinch starting — so a user who began a
      long-press, then added a second finger to pinch-zoom instead, would
      still have the original node (or edge) deleted out from under them
      ~600ms later with no warning. `abortActiveDrag()` now clears it as
      its first action.
- Tests (`tests/pointer-interrupt.spec.mjs`, 10 tests — 8 from the initial
  bugfix pass, expanded by 2 in a later test-coverage pass, plus 3 new
  tests spread across `tests/group-move.spec.mjs`/`tests/phase2.spec.mjs`/
  `tests/phase4.spec.mjs`, all green): a pinch interrupting a
  single-finger node drag commits the partial move as one undo step
  instead of losing it, and undo reverts it exactly; an immediate pinch
  (no movement yet) produces no spurious undo step; a pinch interrupting a
  *group* drag commits the group's move and its cascaded member move
  together as one step, membership intact, and undo restores both exactly;
  a pinch interrupting a group *resize* commits the partial resize as one
  step and never moves the group's own position; a pinch cancels a pending
  long-press-delete timer for both a node and an edge (proven by actually
  waiting past the 600ms threshold and confirming survival, not just
  checking the timer variable); a pinch interrupting a `createEdge` drag
  (dragging from a node's connect-handle) creates no phantom edge and no
  undo step; a second finger's pointerdown never hijacks an in-progress
  drag — proven by continuing to move the *first* finger after the pinch
  starts and confirming the node no longer responds to it; a **genuine**
  `pointercancel` event (not synthesized via a pinch's second finger, but
  dispatched directly — the other real-world trigger, e.g. the OS
  reclaiming a gesture) also commits a partial drag instead of losing it,
  through the exact same `abortActiveDrag()` path; a `pointercancel`
  during a *pan* (which has no undo history at all) cleanly ends it with
  no spurious history entry, and a fresh drag afterward works normally —
  proving `dragMode`/`activePointerId` were fully released, not left in a
  stuck state. Plus 3 more finds from the same test-coverage pass (not
  bugs, but under-tested interactions worth locking in, except the group-
  move one below, which *did* surface a real bug — see the Phase 2
  section above): a node that's a member of two overlapping groups keeps
  membership in the one being dragged (carried along) but correctly loses
  it in the stationary one it no longer overlaps once the drag lands,
  proving the end-of-drag membership recompute re-evaluates *every* listed
  group against the node's new position, not just the one that moved
  (`group-move.spec.mjs`); long-pressing a group node (with a member) via
  touch deletes it and cleans up membership/the edge the same way keyboard
  Delete already does (`phase2.spec.mjs`); a `localStorage.setItem` write
  failure is caught without crashing the app or hanging `whenIdle()`
  (`phase4.spec.mjs`).

### End-to-end workflow test (test-coverage addition, no new feature)

- [x] `tests/end-to-end-workflow.spec.mjs` — a single, long, realistic user
      session exercising many features *together*, deliberately breaking
      from the rest of the suite's "one file per phase/feature, small
      focused tests" convention (see its own note in "Testing Strategy"
      above). Two more real, pre-existing gaps were found and fixed while
      writing it (both in `commitTxtImport()`, a different code path from
      the drag-based `updateGroupMembership()` PR #18 already fixed —
      see those Phase 6/Phase 4 sections above): the redundant-ancestor
      contains-declaration bug, and the OPFS write-failure test.
- Tests (`tests/end-to-end-workflow.spec.mjs`, 1 test — deliberately one
  long narrative, not many small ones, since the point is exercising
  everything in the same session, not isolating any single step): renames
  the graph title; toggles theme and language (and back); builds a group
  with two committed members plus a node deliberately left outside it,
  checking the member-hue test hook along the way; creates two parallel
  (bent) edges between the two members plus an ordinary edge to the
  outside node, checking their curves are visibly distinct; double-clicks
  to rename a member, asserting the rename field anchors to that node's
  own center (not the click point); drags the group and confirms both
  members move by the exact same delta, membership survives, and the
  bent edge between them still resolves to real (finite) geometry;
  resizes the group and confirms members never move; runs Auto-layout and
  confirms it's exactly one undo step with both members still fully
  contained (using the same epsilon-tolerant containment check
  `phase8.spec.mjs` uses, not a stricter one — a strict check was the
  first version of this test's own bug, not the app's, caught immediately
  by a real run); clicks Save Version and confirms the version counter
  increments (from whatever it was, including the lazily-initialized
  `state.meta === null` case before any save has ever happened); undoes
  three steps in a row (autolayout, resize, move) checking the exact
  state at each intermediate step, then redoes all three back and asserts
  the result is `deepEqual` to the pre-undo snapshot, not just "similar";
  reloads the page and confirms the whole graph, the theme, the language,
  and the graph title all survive together; imports a TXT file (merge)
  that adds a new group member via a `contains` line and confirms it
  joined without disturbing anyone already there; and finally Clears the
  graph and undoes that back to the exact full state from just before.

### Priority test-coverage completion (planned, no new feature — no bugs found)

Closes out the "high" and "medium" priority items from an earlier planning
pass (`what's complex and under-tested?`) that weren't already implemented
in prior rounds (the plan's top two, TXT import's redundant-ancestor bug
and OPFS write-failure coverage, were already done — see their own
sections above). **Every test in this round passed on the first real run
with no app changes needed** — unlike several earlier QA rounds, this
batch didn't surface new bugs; it closes out coverage for scenarios the
app's existing design already handled correctly, and proves that rather
than assume it.

- [x] **Compounding storage failures** (`tests/phase7.spec.mjs`, +1 test):
      a Tier 2 (folder sync) write failure *and* a simultaneous Tier 1
      (localStorage) write failure, both induced at once from the same
      Save Version click — confirmed neither compounds into a crash, a
      hang, or a lost save; the Tier 2 side still falls back to its usual
      Tier 3 downloads, the Tier 1 side's `whenIdle()` still resolves, and
      a later save with both failures lifted persists correctly.
- [x] **Autolayout under adversarial graphs** (`tests/phase8.spec.mjs`,
      +4 tests): a 3-node cycle, a dense 8-node/28-edge all-pairs graph
      (plus confirming no two nodes collapse onto the exact same point
      despite 28 competing pulls), an overcrowded 10-member group in a
      small box all pulled toward the same distant outsider, and a mixed
      graph combining disconnected islands, a floating group, and 3-level
      group nesting all at once — every case checked for `Number.isFinite`
      positions, a sane completion time, and (where applicable) every
      containment invariant holding simultaneously.
- [x] **Parallel edges beyond 3** (`tests/parallel-edges.spec.mjs`,
      +1 test): 5 edges between the same pair bend at precisely the
      expected symmetric, evenly-spaced offsets (steps -2,-1,0,+1,+2 ×
      `EDGE_BEND_STEP`, checked as *signed* offsets along the perpendicular
      axis, not just "5 different distances"), and — the part most likely
      to break first at higher multiplicity — every one of the 5 curves is
      still individually resolvable by clicking its own midpoint, not just
      "some of them."
- [x] **Deep undo/redo stress across heterogeneous action types**
      (`tests/phase3.spec.mjs`, +1 test): a 9-step sequence mixing group
      creation, a membership-committing drag, a resize, a rename, a plain
      add, a connect, a rigid-body group move (cascading a renamed member
      along with it), and a delete — a full snapshot taken after *every*
      step, then undone one step at a time checking an exact `deepEqual`
      match against each recorded snapshot in reverse (not just the two
      ends), then redone all the way forward checking the same snapshots
      again going forwards.
- [x] **`abortActiveDrag()`'s diff cost at scale** (`tests/pointer-interrupt.spec.mjs`,
      +1 test): a pinch interrupting a drag on a 1,000-node graph (the same
      scale `phase9.spec.mjs` already stress-tests for render/culling)
      still commits correctly and well within a generous time budget — the
      `JSON.stringify`-based before/after diff this path uses doesn't
      introduce a perceptible hang even at that size.
- [x] **Rename-field anchoring under zoom + pan-near-edge + group
      membership, all three at once** (`tests/rename.spec.mjs`, +1 test):
      a group member zoomed in heavily and panned so its true (unclamped)
      center is genuinely off-screen — confirmed the field still opens
      pre-filled with the correct label, the viewport clamp still keeps it
      fully on-screen and clear of the toolbar, and the rename itself
      commits correctly with membership intact throughout.

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
- 2026-07-25 — PR #3 (Phase 3) merged to `main` by the user. Restarted this
  branch from `origin/main` again per the merged-PR protocol before
  starting Phase 4 — same clean case as the prior two restarts.
- 2026-07-25 — Phase 4 (Tier 1 storage) implemented in `index.html`
  (`tests/phase4.spec.mjs`, 11 tests; 80 total). **This phase surfaced a
  real spec/reality conflict, resolved by asking the user rather than
  deciding unilaterally:**
  - **The discovery.** Section 3.1's capability matrix marks OPFS as
    universally supported, and Section 2 promises the app "opens directly
    in a browser... no external server required" (i.e., double-click
    `index.html`, a `file://` URL). Empirically testing
    `navigator.storage.getDirectory()` under a `file://` origin in
    Chromium throws `SecurityError` — OPFS is *only* usable when the page
    is actually served over http(s). Taken literally, an OPFS-only Tier 1
    would provide **zero** crash protection for anyone using the app in
    exactly the mode Section 2 advertises as the primary one. This isn't a
    coding bug to route around silently — it's a real conflict between two
    spec claims, discovered by the same headless-testing setup this
    project has been using for verification all along.
  - **The question asked and the answer.** Presented three options: (a)
    OPFS + automatic localStorage fallback when OPFS is unusable, keeping
    "always-on, all platforms" true in both deployment modes; (b) OPFS
    only, exactly as spec's Section 3.2 names it, accepting that Tier 1
    silently no-ops under `file://`; (c) OPFS only, but with a visible
    one-time UI warning when unavailable. **User chose (a).**
  - **Implementation.** `detectStorageBackend()` tries OPFS first (feature
    presence *and* an actual `getDirectory()` call, since presence alone
    doesn't mean it'll work); on failure, falls back to `localStorage`
    (verified via a quick probe write). The choice is cached for the
    session. Both backends persist the same minimal payload —
    `{nodes, edges, nextNodeNum, nextEdgeNum}` — deliberately *not*
    camera/selection/mode/undo-history, which stay ephemeral/session-only
    (consistent with Phase 3 already not persisting the undo stack).
    Saves are coalesced through a small scheduler (`scheduleSave` /
    `runSaveLoop`) rather than queued: a burst of edits while a write is
    in flight collapses into exactly one trailing save of the latest
    state, and writes never run concurrently. Hooked into the single
    `pushHistory()` choke point plus `undo()`/`redo()` directly (since
    those bypass `pushHistory`), so it automatically covers every current
    and future action that goes through the undo system — no per-handler
    wiring needed.
  - **id counters are persisted alongside the graph** (not just
    nodes/edges) — without this, a restored session that then adds a new
    node would regenerate a colliding id, violating "ids are never reused"
    (Section 4.1).
  - **Testing implication:** since `file://` can only ever exercise the
    localStorage fallback, a genuine end-to-end check of the OPFS code
    path required actually serving the file. Added
    `tests/lib/server.mjs` — a ~30-line dependency-free static file server
    (`node:http` + `node:fs`) used only by `phase4.spec.mjs` — so both
    backends are verified against the real browser API, not just one of
    them by construction of the test environment.
- 2026-07-25 — Follow-up question after Phase 4 shipped: "does opening
  index.html resume the last disk-synced state, and how does browser
  close/reopen work?" Verified empirically (not just reasoned about)
  with a real `launchPersistentContext` test — fully closing the browser
  process and relaunching it fresh against the same profile still
  restored a node added in the prior session, confirming Tier 1 survives
  a real browser restart, not merely a same-process page reload.
- 2026-07-25 — Added a "Clear" button + confirm-dialog feature (user
  request, outside the phased plan — tracked in its own section above
  rather than shoehorned into a phase number). `tests/clear-graph.spec.mjs`
  (12 tests; 92 total across the whole suite). Notable decisions:
  - **Confirm dialog is a custom centered modal, not native `confirm()`**
    — same rationale already established for node/edge inline entry in
    Phase 1: consistent styling and DOM-testability. Cancel, clicking the
    backdrop, and Escape are all equivalent "back out" paths; Enter and
    the dialog's own button are equivalent "proceed" paths.
  - **Free undo/redo support, not reimplemented.** Clear goes through the
    exact same `snapshotState()` / `pushHistory()` pair as every other
    mutating action (Phase 3), so it's automatically exactly one undo
    step and automatically triggers a background save (Phase 4) — no new
    persistence or history code needed, just correct use of the existing
    choke points.
  - **id counters are not reset by Clear.** Consistent with delete never
    resetting them either — if a user Clears, then Undoes, then keeps
    editing, ids must still never collide with anything that existed
    before the Clear.
  - The dialog's Escape handling is checked *before* the existing
    Escape-cancels-armed-mode logic in the global keydown handler (an
    early return when the dialog is open), so Escape while the dialog is
    showing only ever dismisses the dialog — it can't also silently
    cancel an unrelated armed Add Node/Add Group/Connect mode underneath
    it in the same keypress.
- 2026-07-25 — PR #4 (Phase 4 + Clear button) merged to `main` by the
  user. Restarted this branch from `origin/main` again per the merged-PR
  protocol before starting Phase 5 — same clean case as prior restarts.
- 2026-07-25 — Phase 5 (File formats — export) implemented in
  `index.html` (`tests/phase5.spec.mjs`, initially 11 tests; 103 total).
  Notable decisions:
  - **Resolved the "graph name" Open Question — initial pick.** First
    implementation: user-entered via the inline-input UI the first time
    "Save Version" is clicked, then stored in `state.meta.graph_name` and
    reused silently on every later save. **This was superseded within the
    same work session** — see the next Log entry below — after asking the
    user directly instead of assuming the provisional pick was final.
  - **`meta` rides along in Tier 1's storage payload** (Phase 4's
    `writeGraphToStorage`/`loadGraphFromStorage`), which is the only way
    "version number... continuous across sessions" (Section 9) can hold:
    without persisting `meta`, every reload would silently reset back to
    an unsaved, version-less graph even after real saves had happened.
  - **Save Version is deliberately not wrapped in `pushHistory()`.** It's
    an export/side-effect action, not a graph mutation — nothing in
    `state.nodes`/`state.edges` changes, so there is nothing to undo, and
    treating it as an undo step would let Undo illegitimately roll back a
    version number that a real file already exists for on disk.
  - **`auto:true` "contains" edges are exported in both formats**, unlike
    canvas rendering (Phase 2, never drawn) and Tier 1 storage (persisted
    as an implementation detail, not user-facing) — Section 5.2 says so
    explicitly ("`contains` edges are included like any other edge"), and
    the JSON schema's own example shows one. Easy to get wrong by reusing
    the `drawEdges`/`findEdgeAt` "skip auto" habit from Phase 2; this
    export code deliberately does not filter by `.auto`.
  - **Testing note**: `Promise.all([page.waitForEvent('download'),
    page.waitForEvent('download')])` proved unreliable for two downloads
    fired synchronously within one click handler (in earlier ad hoc
    verification, both promises resolved to what looked like the same
    event). Switched to collecting via a persistent `page.on('download',
    ...)` listener instead, which reliably captured both with correct,
    distinct filenames — used throughout `phase5.spec.mjs`.
- 2026-07-25 — Revised the graph-name UX after asking the user directly
  (PR #5 was still open/unmerged at this point, so the change was pushed
  as more commits to the same branch rather than a follow-up PR). Offered
  three options — (a) keep the one-time save-time prompt just shipped,
  (b) an always-visible, always-editable title in the toolbar defaulting
  to "Untitled Graph," (c) no user input at all, an auto-generated name.
  **User chose (b).** Reworked accordingly:
  - `graphName` moved out of `state.meta` to its own top-level
    `state.graphName` field (default `"Untitled Graph"`), since it's now
    conceptually independent of whether the graph has ever been saved —
    the title is visible and renamable from the very first paint, while
    `state.meta` (format_version/graph_id/version/created) still only
    gets created on the first actual "Save Version" click. Persisted via
    Tier 1 alongside `meta` (same reasoning as above).
  - Added `#graph-title`, a `role="button"` span at the start of the
    toolbar. Click, or Enter/Space while it has focus, opens the same
    `showInlineInput()` used everywhere else, pre-filled with the current
    name; Escape cancels; an empty/whitespace commit reverts to
    `"Untitled Graph"` rather than leaving the title blank.
  - **Display value vs. filename value are now different strings.**
    `state.graphName` stores the raw, human-typed name as-is (so the
    title can read "Frankfurt AI Ontology") — `sanitizeGraphName()` is
    now applied only at the moment `performSaveVersion()` builds a
    filename, not when the rename commits. This is strictly better than
    the superseded design, which sanitized (and thus visually mangled)
    the name immediately on entry.
  - `performSaveVersion()` now lazily creates `state.meta` itself if
    absent (same shape as before), so "Save Version" is a single
    unconditional action again — no branch on "is this the first save,"
    since naming is no longer coupled to saving at all.
  - Rewrote `tests/phase5.spec.mjs` end to end for the new UX (11 → 17
    tests): title default/visibility, click-to-rename and its pre-filled
    value, keyboard (Enter/Space) access, Escape-cancels, empty-commit
    reverts to the default, the renamed title surviving a reload, Save
    Version never blocking on a prompt, filename sanitization happening
    at save time while the displayed title stays raw, and confirming
    `graph_name` is correctly absent from the exported JSON's `meta`
    object (it was always filename-only, per spec's own schema example —
    that part didn't change).
- 2026-07-25 — PR #5 (Phase 5 + the title-UX revision) merged to `main` by
  the user. Restarted this branch from `origin/main` again per the
  merged-PR protocol before starting Phase 6 — same clean case as prior
  restarts.
- 2026-07-25 — Phase 6 (TXT import) implemented in `index.html`
  (`tests/phase6.spec.mjs`, 17 tests + `tests/fixtures/*.txt`; 126 total).
  Notable decisions:
  - **Found and fixed a real bug in spec.md's own reference Python
    loader** (the Appendix). As literally written:
    ```python
    if not line or line.startswith("#"):
        continue
    if line == "## NODES":
        section = "nodes"
    ```
    `"## NODES"` and `"## EDGES"` both start with `"#"`, so the generic
    comment-skip catches them first and the header checks below are dead
    code — the reference loader, run as-is, would parse nothing at all
    out of its own worked example. This wasn't caught by reading the code;
    it was caught by porting it to JS the same way and then running it
    against spec's own example file, which came back with 0 nodes/0
    edges. The JS port in `index.html` checks the two exact header strings
    *before* the generic `"#"`-comment skip, which correctly reproduces
    the format the prose and worked example actually describe. `spec.md`
    itself was **not** edited (frozen v1.0 reference, per this file's own
    stated convention) — this delta is recorded here only. Worth a note to
    anyone hand-porting the Appendix snippet elsewhere.
  - **Unified one dialog for both Merge and Replace**, opened after a file
    is chosen (file picker or drag-drop), rather than two separate flows.
    Section 7's interaction table lists exactly one entry point ("Import
    from TXT") for the whole feature, but Section 5.3 defines two distinct
    modes and mandates a confirmation-with-diff-summary specifically for
    Replace — there's no second button to reach Replace through otherwise.
    The dialog shows live diff counts for *both* modes side by side (via
    `planTxtImport()`, the same function the commit path uses, so the
    numbers shown are guaranteed to match what actually happens) with
    Merge and Replace as separate buttons, Merge visually primary. This is
    a necessary UI addition beyond Section 7's literal table, the same
    category of decision as Add Group's button and the group resize
    handle in Phase 2.
  - **Edge identity for diffing is the full (source, target, relation,
    directed) tuple.** Spec doesn't define edge equality precisely; this
    is the most literal reading of "edges present in the TXT but missing
    from the graph are added" given labels aren't unique ids and a node
    pair can legitimately have multiple edges with different relations
    (already true since Phase 1). A `directed` flag flip is therefore
    treated as a different edge for diffing purposes, not an in-place
    update to an existing one.
  - **A `"X -> Y : contains"` line only becomes a membership declaration
    if X actually resolves to a `type: "group"` node** (after this
    import's own node creation/matching). If X is an entity, the line is
    silently skipped — spec doesn't address this malformed case, and
    creating a fake edge or crashing both seemed worse than ignoring one
    bad line.
  - **Replace mode's group-membership handling**: a surviving node's
    `groups[]` is recomputed to exactly the containment declarations this
    TXT makes for it — memberships not redeclared are dropped (and their
    `contains` edge removed), mirroring how ordinary edges absent from the
    TXT get removed in Replace mode. Position/size are still left alone
    for any node matched by label+type, same as Merge.
  - **"Flagged as newly added" is a transient, non-persisted highlight**
    (`newlyImportedIds`, a plain `Set` outside `state`, not part of any
    snapshot/export), cleared automatically at the top of `pushHistory()`
    — so it survives exactly until the *next* discrete action, matching
    "briefly highlighted, then normal" without needing a timer or
    extending the single-selection model to multi-select.
  - **Diff counts shown are nodes+ordinary-edges only** (not membership
    changes) — spec doesn't specify exact counting rules, and node/edge
    counts are the figures a user actually recognizes when sanity-checking
    an import.
- 2026-07-25 — PR #6 (Phase 6) merged to `main` by the user. Restarted this
  branch from `origin/main` per the merged-PR protocol before this
  follow-up fix — same clean case as prior restarts.
- 2026-07-25 — Follow-up: user asked to verify the Python-reference-loader
  bug claim empirically (not just trust the earlier write-up), then asked
  for it to be fixed everywhere in one consistent state — spec.md, a real
  standalone Python file, and the JS port — with a test for the Python
  side too.
  - **Verification, on request, before touching anything.** Extracted the
    exact worked example text directly out of `spec.md` (via regex over
    the raw file, not my own retyped fixture) and ran spec's exact
    Appendix code, character-for-character, against it in a real Python
    3.11 interpreter: `NODES: []` / `EDGES: []`. This is what justified
    editing spec.md itself, rather than resting on the earlier JS-port
    finding alone.
  - **spec.md was directly edited** — the one deliberate exception to this
    file's own "keep spec.md frozen, record deltas here" rule in the whole
    project so far, because the user explicitly asked for a single
    consistent fix rather than another delta entry. The Appendix snippet
    now has the corrected check order plus the same malformed-line
    handling described below; `tools/load_edge_list.py` is kept
    byte-identical to it (mechanically diffed to confirm — see
    `tests/python-parity.spec.mjs` and the ad hoc check run this session).
  - **Second, smaller consistency fix beyond the header-order bug**: the
    original reference snippet would raise `ValueError` on a malformed
    edge line (e.g. no `" : "` separator — `line.rsplit(" : ", 1)` can't
    unpack into two names), while the JS importer has always silently
    skipped such lines. Left alone, "the reference loader" and "the app's
    real importer" would disagree on how to handle a slightly malformed
    hand-edited file — exactly the kind of inconsistency the user asked to
    eliminate. Added the same skip-on-malformed behavior to both spec.md's
    snippet and `tools/load_edge_list.py`. This is a real behavioral
    change to spec's reference code, not just a check-order fix, flagged
    here explicitly since it's a bigger deviation than the original bug
    report described.
  - **New `tools/` directory**: `load_edge_list.py` (the standalone,
    tested loader) and `test_load_edge_list.py` (15 `unittest` tests,
    stdlib only, matching this project's "no dependencies" ethos for the
    Python side too). Both reuse `tests/fixtures/*.txt` — the same files
    `tests/phase6.spec.mjs` uses — so the JS and Python suites are checked
    against one shared set of examples, not two that could quietly drift.
  - **New `tests/python-parity.spec.mjs`** (4 tests, one per fixture):
    runs `tools/load_edge_list.py` as a subprocess and deep-equals its
    output against `window.parseTxtImport()` (the JS importer's parser,
    reachable directly since top-level `function` declarations in a
    classic `<script>` become `window` properties — confirmed empirically
    while debugging the original bug, not an intentional public API).
    Skips gracefully, with a console warning rather than a failure, if
    `python3` isn't on `PATH` — consistent with how Playwright-dependent
    tests are already treated as environment-dependent nice-to-haves per
    the Testing Strategy section.
  - Ran everything before considering this done: `node --test
    tests/*.spec.mjs` (130 tests) and `python3 -m unittest discover -s
    tools -p "test_*.py"` (15 tests), both fully green.
- 2026-07-25 — PR #7 (spec/Python/JS consistency fix) merged to `main` by
  the user. Restarted this branch from `origin/main` per the merged-PR
  protocol before starting Phase 7.
- 2026-07-25 — Phase 7 (Tier 2 storage — live folder sync) implemented in
  `index.html`. Notable decisions:
  - **New `#btn-folder-sync` toolbar button**, hidden by default
    (`style="display:none"`) and only revealed by `boot()` when
    `'showDirectoryPicker' in window` is true — Brave and Chrome/Android
    don't expose the API at all (Section 3.1), so this single feature
    check is sufficient; no separate platform/UA sniffing needed. Button
    text/`aria-pressed` toggle between `"Folder Sync"` (disconnected) and
    `"Synced: <folder name>"` (connected), driven by
    `updateFolderSyncButton()`.
  - **`performSaveVersion()` now branches on a module-level
    `tier2DirHandle`**: if set, both export files are written silently into
    the granted folder via `FileSystemDirectoryHandle.getFileHandle()` →
    `createWritable()` → `write()`/`close()`, and Tier 3's `<a download>`
    is *not* also triggered — Tier 2 replaces Tier 3 for that save, it
    doesn't supplement it (a save that both silently wrote to a folder
    *and* popped a browser download would be surprising, and Section 3.2
    frames Tier 2 as a strictly better mode once connected, not an
    additive one). If a write fails after grant (e.g. permission revoked
    mid-session, disk full), it falls back to the ordinary two-download
    path in a `.catch()` rather than silently losing the save.
  - **Session-scoped grant only** — `tier2DirHandle` is a plain in-memory
    variable, not persisted to Tier 1 storage or IndexedDB, so a reload
    always starts back at Tier 3 baseline and requires re-granting. The
    File System Access API does support persisting a handle for later
    re-grant via IndexedDB, but spec Section 3.2 only requires "no further
    prompts" *once granted*, not that the grant itself survive a reload —
    treated as a possible future enhancement, not a gap against what's
    actually specified. Flagged here in case that reading is ever
    revisited.
  - **`AbortError` (user cancels the picker) is swallowed silently**
    (`console.warn` only for any *other* rejection reason) — cancelling is
    an expected, non-error outcome, consistent with how the rest of the
    app treats Escape/cancel on its own dialogs.
  - **Test hook surprise**: headless Chromium (via Playwright) actually
    *does* expose `window.showDirectoryPicker` as a real function — the
    property exists independent of any user-gesture grant, it's only
    *invoking* it without a gesture that would fail. This meant real
    end-to-end coverage was possible by mocking
    `window.showDirectoryPicker` itself (via Playwright's
    `addInitScript`, installed before `index.html`'s own scripts run,
    since `boot()`'s feature detection runs synchronously at load) rather
    than only the feature-detection branch-coverage originally sketched
    in this file's Phase 7 plan. Added `window.__kg.tier2` (`
    waitForSaveVersion`, `getDirHandle`, `setDirHandle`) as the test hook,
    mirroring Phase 4's `storage.whenIdle()` pattern.
  - Wrote `tests/phase7.spec.mjs` (8 tests): button hidden/shown by feature
    detection; real app usability with Tier 2 entirely absent; successful
    mock grant updates button state; `AbortError` cancel leaves it
    disconnected with no console error; a connected save writes exactly
    two correctly-named, valid-JSON/TXT files into the mock folder and
    fires zero downloads; a post-grant write failure falls back to the
    normal two-download path; unconnected Save Version is unchanged from
    pre-Phase-7 baseline; the `setDirHandle` hook drives the same button
    state as a real grant. Ran the full suite before considering this
    done: `node --test tests/*.spec.mjs` (138 tests) and `python3 -m
    unittest discover -s tools -p "test_*.py"` (15 tests), both green — no
    regressions in Phases 0–6.
  - **Manual verification still outstanding** (real Chrome/Windows and
    Chromium/Linux folder grant + write-back, and confirming Brave/Chrome-
    Android never offer the button) — this can only be done on real OS/
    browser combinations, not in headless CI, so it's flagged in Current
    State rather than checked off.
- 2026-07-25 — PR #8 (Phase 7) merged to `main` by the user. Restarted this
  branch from `origin/main` per the merged-PR protocol before starting
  Phase 8.
- 2026-07-25 — Phase 8 (Autolayout) implemented in `index.html`. Notable
  decisions:
  - **Algorithm: force-directed (Fruchterman-Reingold style)**, chosen
    over hierarchical or grid layout because it needs no notion of "root"
    or "levels" (this graph model has neither) and degrades gracefully to
    something reasonable for arbitrary, possibly-cyclic, possibly-
    disconnected graphs — which is exactly the shape of data this app
    allows. Repulsion runs over **every pair of nodes**, not just
    connected ones, specifically so disconnected components and floating
    groups (explicit test-plan requirements) still spread apart instead of
    settling on top of each other; attraction runs only along edges.
  - **Relaxation starts from the graph's current positions**, not a fresh
    random scatter — deliberately avoids any RNG. This makes a given
    graph + starting layout produce a deterministic result, which is what
    makes exact-position-equality assertions in the test suite (e.g. "one
    Redo reproduces the exact same result") possible without a fixed seed.
  - **Fixed iteration count (200) with a cooling schedule** (temperature,
    i.e. max per-iteration displacement, multiplied by 0.95 each pass)
    guarantees termination regardless of graph shape — satisfies "doesn't
    hang" by construction rather than by hoping convergence happens.
  - **Group boxes are moved exactly like any other node, keeping their own
    `w`/`h`.** This is intentional, not an oversight: `boundary_mode` is
    always `"manual"` (Section 4.3, Decision from Phase 2) — nothing in
    this app ever auto-fits a group's box to its members' positions, on a
    drag or otherwise, so it would be inconsistent for autolayout alone to
    start doing so. A member may end up visually outside its group's box
    after a layout pass; `groups[]` membership itself is untouched (proven
    by a dedicated test), same as after any manual group-box drag.
  - **Single choke point, no new pattern**: `autoLayout()` takes one
    `snapshotState()` before mutating, one after, and calls the existing
    `pushHistory()` — the same command-pattern mechanism every other
    action already uses, so "one undo step regardless of node count"
    falls out of the existing undo/redo design rather than needing
    special-casing.
  - **No-op guard for <2 nodes** (`state.nodes.length < 2`) — nothing to
    relax, and skipping avoids pushing a spurious no-op undo step for an
    empty or single-node graph.
  - Wrote `tests/phase8.spec.mjs` (5 tests, see the Phase 8 section above
    for full coverage list). Also spot-checked headlessly outside the test
    suite with a 12-node/11-edge chain graph (mixed entity/group node
    types) and printed resulting positions: nodes spread into a readable
    line, no overlapping coordinates, no `NaN`/`Infinity` — recorded here
    since it's evidence beyond what the automated assertions check
    (aesthetic sanity, not just correctness). Ran the full suite before
    considering this done: `node --test tests/*.spec.mjs` (143 tests) and
    `python3 -m unittest discover -s tools -p "test_*.py"` (15 tests),
    both green — no regressions in Phases 0–7.
- 2026-07-25 — PR #9 (Phase 8) merged to `main` by the user. Restarted this
  branch from `origin/main` per the merged-PR protocol before starting the
  next requested item.
- 2026-07-25 — Added a dark/light theme toggle (out-of-spec, user-
  requested, same standing as the Clear button — see its own section
  above). Notable decisions:
  - **Explicit toggle, not `prefers-color-scheme`.** The app has always
    been dark-only; adding a light option and then silently switching
    users to it based on OS setting would be a bigger, unrequested change
    than "add a toggle." `:root`'s `color-scheme` was narrowed from
    `light dark` to plain `dark` for the same reason — it was declared but
    never backed by an actual light variant before this, so it was already
    slightly misleading.
  - **One CSS custom-property source of truth for every themeable color**,
    including the ones Canvas2D draws with — not a parallel JS palette
    object that could quietly drift from the CSS one. The previously
    hardcoded `NODE_FILL`/`EDGE_STROKE`/etc. constants are gone; a new
    `resolveColors()` reads all of them via `getComputedStyle` once per
    `render()` call (not once per node/edge — a real, if small, perf
    consideration) and the result is threaded through `drawGrid()`,
    `drawEmptyState()`, `drawEdges()`, `drawNodes()`, `drawGhostEdge()` as
    a plain parameter. `drawGrid()`/`drawEmptyState()` already did their
    own per-call `getComputedStyle` lookup for `--grid-dot`/`--empty-fg`
    (Phase 0); folded into the same mechanism rather than left as a second
    pattern.
  - **Button label is a status ("Theme: Dark"/"Theme: Light"), not a
    command.** First draft used the target-mode-style label the Folder
    Sync button uses ("Dark Mode"/"Light Mode"), but on reflection that
    reads ambiguously for a single on/off toggle — is "Dark Mode" naming
    the mode you're in or the mode you'd switch to? A status-style label
    has only one reading. `aria-pressed` still follows the existing
    Folder-Sync-style convention (`true` when the non-default state, light,
    is active).
  - **Persisted separately from the graph** (`localStorage["kg-theme"]`,
    not part of `state` or the Tier 1 payload) — this is a UI preference
    that should outlive Clear, TXT import/replace, and switching graphs
    entirely, none of which should ever touch it.
  - **Applied at top-level script scope, before `boot()` runs** — setting
    `document.documentElement.dataset.theme` has to happen before the
    first paint to avoid a dark-then-light flash on load; `boot()` itself
    only fills in the button's initial label/`aria-pressed` (which does
    need the DOM element to exist first).
  - Wrote `tests/theme.spec.mjs` (6 tests): defaults to dark with no prior
    `localStorage`; the toggle flips the `<html>` attribute/label/
    `aria-pressed` both directions; toggling actually changes a rendered
    canvas pixel (sampled near a node's corner, deliberately away from its
    centered label text — sampling the exact center first caught a real
    test bug, since the label glyph's own theme-dependent color
    contaminated the sample and produced a mid-gray antialiased read
    instead of the fill color); the choice survives a reload; toggling
    never pushes an undo/redo history entry, confirming it's a display
    preference and not a graph edit; the `window.__kg.theme` hook mirrors
    the button. Also spot-checked visually via headless screenshots of
    both themes side by side (readable contrast, no illegible text/edges
    in either). Ran the full suite before considering this done: `node
    --test tests/*.spec.mjs` (149 tests) and `python3 -m unittest discover
    -s tools -p "test_*.py"` (15 tests), both green — no regressions in
    Phases 0–8 or the Clear button.
- 2026-07-25 — PR #10 (dark/light theme toggle) merged to `main` by the
  user. Restarted this branch from `origin/main` per the merged-PR
  protocol before starting the next requested item.
- 2026-07-25 — Follow-up question: "in autolayout, groupings are
  respected?" Answered first without implementing (per the user's
  explicit request), based on a direct re-read of `autoLayout()`: members
  *were* softly pulled toward their group via the auto-generated
  `"contains"` edge (autolayout's attraction pass doesn't filter out
  `edge.auto`), but nothing prevented a member from ending up outside its
  group's box — no explicit containment constraint existed, only that
  incidental spring pull. The user then asked to make containment
  explicit: "group boundaries should be not penetrable by the things
  contained." Implemented in `index.html`:
  - **New `clampCenterIntoGroup()` helper and a per-iteration containment
    pass inside `autoLayout()`'s relaxation loop.** After each iteration's
    forces are applied (repulsion + edge attraction, including the
    contains-edge pull already described above), every node with a
    non-empty `groups[]` has its center clamped so its full rectangle
    stays inside every group it belongs to. This is an explicit hard
    constraint layered on top of the existing soft pull — the soft pull
    alone doesn't guarantee containment (a strong unrelated edge, or
    repulsion from other nodes, can still push a member toward the edge of
    its box or past it), so the constraint has to be enforced separately
    every iteration, not just hoped for from the spring force.
  - **`GROUP_CONTAINMENT_PASSES = 5`** repeated clamp passes per iteration,
    to let the constraint propagate through nested groups (member → inner
    group → outer group) without needing a topological sort — a fixed,
    generous pass count is enough since real nesting depth in this app is
    always small, and is far cheaper to reason about than computing a
    correct processing order every iteration.
  - **Only members, never arbitrary overlapping nodes.** The user's ask
    was specifically about "the things contained" — an unrelated node that
    happens to overlap a group's box (without being a member) is
    unaffected, matching the existing "membership isn't recomputed by
    autolayout" behavior from the original Phase 8 work.
  - **Scoped entirely to `autoLayout()`.** A manual drag can still pull a
    member fully out of its group exactly as before — Phase 2's own
    membership rules (`updateGroupMembership`, overlap-based add/remove)
    are completely unaffected; this only hardens what autolayout itself
    guarantees, since that's what was asked.
  - **Best-effort, not a hard guarantee, when a member is larger than its
    group's interior** (`Math.min`/`Math.max` around the clamp bounds keeps
    `clamp()`'s `lo <= hi` contract intact instead of producing `NaN`) —
    this is an already-possible pre-existing state (a manual resize could
    already make a member bigger than its group before this change), not
    something autolayout creates, so it's handled defensively rather than
    guaranteed leak-proof.
  - Added 4 tests to `tests/phase8.spec.mjs` (5 → 9 total): a member stays
    fully inside its group even against a strong edge pulling it toward a
    distant node (proves the clamp actually overrides physics rather than
    coincidentally already holding); all members of a multi-member group
    stay contained simultaneously; nested containment (member inside inner
    group inside outer group, with the inner group deliberately sized
    smaller than the outer so containment has real slack to check instead
    of an exact coincidental box match); a member deliberately bigger than
    its (tiny) group produces no crash or non-finite position. Also spot-
    checked manually (outside the test suite) with a member connected by a
    strong edge to a node 2000+ units away: both group and member drifted
    substantially under the force simulation, but the member's final
    rectangle stayed exactly inside the group's final rectangle — good
    evidence the clamp holds even under real competing forces, not just in
    a static setup. Ran the full suite before considering this done: `node
    --test tests/*.spec.mjs` (153 tests) and `python3 -m unittest discover
    -s tools -p "test_*.py"` (15 tests), both green — no regressions in
    Phases 0–8, the Clear button, or the theme toggle.
- 2026-07-25 — PR #11 (explicit group containment in Auto-layout) merged
  to `main` by the user. Restarted this branch from `origin/main` per the
  merged-PR protocol before starting Phase 9.
- 2026-07-25 — Phase 9 (Scale & performance) implemented in `index.html`.
  Notable decisions:
  - **Viewport culling via a single `visibleWorldRect()` helper**, reused
    for both drawing and hit-testing rather than two separate mechanisms.
    A 50-world-unit padding (scaled by `1/camera.scale`, so it reads as a
    constant ~50 screen px margin at any zoom) keeps things that visually
    extend a little past a node/edge's own geometry — resize handles, edge
    labels, the dashed group outline — from popping in/out right at the
    screen edge.
  - **Hit-testing culling is provably behavior-preserving, not just an
    optimization that happens to still pass tests.** `findNodeAt`,
    `findNodeHandleAt`, `findGroupResizeHandleAt`, and `findEdgeAt` are all
    called with a world point derived from a click inside the canvas —
    which by construction is always inside the same `visibleWorldRect()`
    used to cull. A node/edge that doesn't intersect that rect can
    therefore never contain that point either, so filtering to the
    visible subset first can't change any hit-test outcome, only skip
    wasted work. `nodesTopmostFirst()` took an optional `rect` parameter
    for this (filtering only when passed one) rather than becoming two
    functions — call sites that genuinely need every node regardless of
    what's on screen (e.g. `updateGroupMembership`, which iterates
    `state.nodes` directly, not through this helper at all) are
    unaffected either way.
  - **Edges are culled by their own segment's bounding box**
    (`edgeBoundingRect()`), not by "is either endpoint node currently
    visible." A long edge whose both endpoints are off-screen but whose
    line still crosses the viewport (a real, if unusual, layout) must
    still draw — tested explicitly, see below.
  - **`renderStats` (nodes/edges drawn vs. total), exposed via
    `window.__kg.perf`, instead of relying on wall-clock timing to prove
    culling works.** Section 9's original test plan suggested "a counter,
    or compare timing zoomed-out vs zoomed-in" — the counter was chosen
    because it gives an exact, CI-noise-immune assertion ("drawn count
    equals the independently-computed geometric overlap"), whereas timing
    comparisons are inherently fuzzy. Timing is still used, but only for
    the one thing a counter can't show — the actual frame-time budget —
    and deliberately framed as a smoke check (a generous 100ms/frame
    threshold), not a strict gate, matching the original plan's own
    language.
  - **`render()` and `markDirty()` were already exposed on `window.__kg`**
    from earlier phases, which let tests drive deterministic, synchronous
    render passes (`camera.scale = ...; render()`) instead of guessing at
    `requestAnimationFrame` timing — no new test hook needed for that part.
  - Wrote `tests/phase9.spec.mjs` (6 tests, see the Phase 9 section above
    for the full list) using a 1,000-node synthetic grid (50 cols × 20
    rows, 300 units apart) seeded directly via `window.__kg.actions` for
    setup speed. Also spot-checked visually (outside the test suite) with
    a smaller on-screen grid via a headless screenshot: partially-visible
    nodes at the viewport's edges still render fully and correctly, no
    pop-in/out artifacts at the boundary. Ran the full suite before
    considering this done: `node --test tests/*.spec.mjs` (159 tests) and
    `python3 -m unittest discover -s tools -p "test_*.py"` (15 tests),
    both green — no regressions in Phases 0–8, the Clear button, the theme
    toggle, or the explicit group-containment work.
  - **Not done in this phase**: real-device 60fps feel (Chrome/Android in
    particular) with a large graph — headless frame-time smoke checks
    don't substitute for actually dragging it on real hardware. Deferred
    to Phase 10 alongside the other hands-on cross-platform checks.
- 2026-07-25 — PR #12 (Phase 9) merged to `main` by the user. Restarted
  this branch from `origin/main` per the merged-PR protocol before starting
  the next requested item.
- 2026-07-25 — Follow-up question: "what is missing?" Answered without
  implementing (per the user's request): everything in Phases 0–9 was
  functionally complete and automated-tested, leaving only Phase 10
  (manual cross-platform verification) and Phase 11 (polish/out-of-scope
  guardrails), plus one cosmetic loose end — the "Open Questions" section
  still listed the autolayout algorithm choice as unresolved even though
  Phase 8 had already picked and documented one.
- 2026-07-25 — User asked to: (1) fix the stale Open Questions entry, (2)
  add considerably more tests across *every* phase, driving the total up
  hard, (3) open a PR, (4) leave everything stable ahead of Phase 10's
  manual testing. Addressed all four:
  - **Open Questions**: struck through the autolayout line and pointed it
    at the Phase 8 Log entry, matching how the graph-name question was
    already resolved there.
  - **Test suite grew from 159 to 193 JS tests** (+34), spread across
    every phase file rather than concentrated in one or two (phase0: 5→11,
    phase1: 31→39, phase2: 17→19, phase3: 16→20, phase4: 11→14, phase5:
    17→21, phase6: 17→22, phase8: 9→10, phase9: 6→7 — see each phase's own
    Tests bullet above for exactly what was added; phase7 and the theme/
    Clear suites were already judged thorough enough and left alone).
    Python suite (15 tests) unchanged — no Python-side gaps identified.
  - **Two real bugs found and fixed** in the process, not just written up
    as findings — the whole point was stability, not a report:
    1. **`setPointerCapture`/`releasePointerCapture` could throw
       uncaught, silently truncating a pinch-gesture handler.** Writing a
       real two-finger pinch test (synthetic `PointerEvent`s with
       `pointerType: "touch"`, dispatched directly rather than relying on
       flaky OS-level touch emulation) exposed this: both calls throw a
       spec-documented `NotFoundError` when the given pointer id isn't
       recognized as currently active. The pan-start code path calls
       `setPointerCapture` and, when a second touch begins a pinch, calls
       `releasePointerCapture` on the *first* touch's id to cancel the
       pan — if either throws, every line of cleanup after it in that
       same handler (`panPointerId = null`, `dragMode = null`, and
       critically `pinchStartDist = distance(...)`) never runs, silently
       breaking that pinch gesture's zoom entirely. Fixed with two small
       wrappers, `safeSetPointerCapture`/`safeReleasePointerCapture`
       (try/catch, swallow and continue), used at all 5 call sites. Real
       touch hardware likely doesn't hit this often (a genuinely active
       finger's capture calls should normally succeed), but it's a real,
       spec-documented failure mode worth hardening against before Phase
       10 puts pinch-zoom in front of an actual touchscreen — and it's
       exactly what made the new pinch test possible to write reliably at
       all, since the synthetic pointer ids used for testing don't count
       as "active" to the browser's capture implementation either.
    2. **Panning the canvas could silently clear the current selection.**
       A pan drag ends with a `pointerup`, but the browser still fires a
       native `click` event afterward on the same element; the click
       handler falls through to `clearSelection()` when the click doesn't
       land on a node/edge. Every *other* drag type (`moveNode`,
       `resizeGroup`) already sets `suppressNextClick = true` when real
       movement occurred, specifically to prevent this; the `pan` branch
       never did. Caught by a new phase1 test ("selection survives an
       unrelated pan"); fixed by adding the same movement-threshold-gated
       `suppressNextClick = true` to the pan branch of the `pointerup`
       handler. A plain click with no movement is unaffected and still
       clears selection exactly as before (existing test coverage for
       that continues to pass unchanged).
  - Ran the full suite repeatedly throughout (after each phase file's
    additions, not just once at the end) and after both fixes: `node
    --test tests/*.spec.mjs` (193 tests) and `python3 -m unittest discover
    -s tools -p "test_*.py"` (15 tests), both green throughout — no
    regressions introduced anywhere by either the new tests or the fixes.
- 2026-07-25 — PR #13 (test-hardening pass) merged to `main` by the user.
  Restarted this branch from `origin/main` before starting the next
  requested item.
- 2026-07-25 — Three new desktop-focused user requirements implemented
  together: parallel-edge bending, editable labels via double-click (+
  touch), and group-drag membership cascade. Notable decisions:
  - **Group-drag membership cascade is a deliberate reversal of an earlier
    decision**, not a new independent feature: Phase 2's "moving the group
    itself afterward does not cascade or alter the member's committed
    membership" test (and the design decision behind it) is now the
    opposite of how the app behaves. The user explicitly asked for a
    group being dragged onto nodes to absorb them, and — for symmetry,
    since the alternative (absorb-only, never release) would be a
    stranger, harder-to-explain rule — a group dragged away from a member
    now releases it too, following the exact same overlap-to-keep/full-
    containment-to-join rules a *member's* own drag already used. Resizing
    a group is unchanged and still never cascades — Section 4.3 is
    explicit about that one specific case, and nothing about the new
    request touches resize. Implemented as `updateMembershipForMovedGroup()`,
    which simply calls the existing `updateGroupMembership()` for every
    *other* node in the graph after a group-type node's drag settles —
    reusing 100% of the existing membership logic rather than duplicating
    it, so both directions (absorb/release) and all existing rules (tie-
    breaking, innermost-wins, nested groups) apply automatically and
    consistently. The old, now-backwards test was rewritten (not just
    deleted) to assert the new, correct behavior, and four more were added
    covering absorption, partial-overlap-keeps-membership, and the
    combined absorb+release-in-one-undo-step case.
  - **Editable labels: double-click reuses `showInlineInput()` verbatim**,
    the same helper creation already used, just pre-filled with the
    current text instead of empty — no new UI mechanism invented. The
    touch-equivalent is a new pencil-icon button in the floating selection
    toolbar (`#sel-rename`), visible for both node and edge selections
    (unlike the direction-toggle button, which only makes sense for
    edges) — chosen over trying to define a reliable double-tap gesture,
    since double-tap is already ambiguous with a fast double-select on
    touch hardware.
  - **Parallel-edge bending: found and fixed two real issues during
    testing, not just at review.** First, the initial bend step (28 world
    units) looked technically correct in the geometry-only unit tests but
    produced genuinely unreadable, overlapping labels in a real screenshot
    spot-check — increased to 60 after visually confirming the result.
    Second — the more serious one — the perpendicular bend direction was
    originally derived from each edge's own source→target vector, so two
    edges in the same parallel group pointing in *opposite* directions
    (A→B and B→A) had their bend axes mirrored relative to each other,
    silently collapsing one edge's offset onto another's instead of
    fanning out. Neither the original geometry unit tests nor a same-
    direction screenshot caught this — only a screenshot using a mix of
    edge directions did. Fixed by computing the perpendicular from a
    canonical (lexicographic node-id) direction instead of the edge's own
    source/target order, and added a dedicated regression test
    ("opposite directions... still fan out distinctly") that fails
    without the fix. A second, unrelated test bug surfaced in the same
    pass: a test click landed on the *previously-selected* edge's own
    floating selection toolbar (positioned above its anchor via
    `translate(-50%,-170%)`), which happened to visually overlap the
    *other* edge's curve at this bend size and silently swallowed the
    click — fixed by clearing selection before the precision clicks in
    that test, not by changing the app (the toolbar's positioning is
    correct and unrelated to the edge-bending feature itself).
  - Exposed `window.__kg.getEdgeGeometry(edgeId)` (anchors, control point,
    actual midpoint) so tests can assert bend offset/direction precisely
    instead of only inferring it from rendered pixels.
  - Wrote three new test files: `tests/rename.spec.mjs` (10 tests),
    `tests/parallel-edges.spec.mjs` (8 tests), plus 3 net new tests in
    `tests/phase2.spec.mjs` (one old test rewritten, four new ones added,
    19 → 22) for the group-drag cascade. Ran the full suite repeatedly
    throughout (not just once at the end, since two of the three features
    each surfaced a real bug mid-testing): `node --test tests/*.spec.mjs`
    (214 tests) and `python3 -m unittest discover -s tools -p "test_*.py"`
    (15 tests), both green — no regressions in any earlier phase or
    out-of-spec feature.
- 2026-07-25 — Hungarian/English localization implemented in `index.html`.
  Notable decisions and a real regression found and fixed along the way:
  - **Scope: UI chrome only, never graph content.** Node labels, edge
    relations, and a graph's own name (once renamed) are user data — never
    auto-translated. Only toolbar/dialog/placeholder/tooltip text and the
    canvas empty-state message are localized. The one deliberate exception
    is the still-*default* "Untitled Graph" placeholder title: since it's
    the app's own text, not something the user wrote, it now retranslates
    on toggle. Detected via `isDefaultGraphName()`, which compares the
    current `state.graphName` against *both* languages' literal default
    string — not a separate boolean flag — so a graph saved as the default
    in one language and reloaded under the other still gets recognized and
    retranslated, and a real user-typed name (even coincidentally identical
    text) is structurally indistinguishable from that check only in the
    single edge case of a user renaming their graph to literally "Untitled
    Graph" — accepted as negligible, same category of edge case as
    `isContainsDeclaration`'s reliance on a magic relation string elsewhere
    in this codebase.
  - **Same pattern as the theme toggle throughout**, deliberately: a
    `STRINGS.{en,hu}` dictionary + `t()` lookup, a `lang` variable read
    from its own `localStorage` key synchronously at top-level script
    scope (before `boot()`), and an `applyLanguage()` DOM-refresh function
    mirroring `updateThemeButton()`'s role — chosen for consistency with
    an already-established, already-tested convention rather than
    inventing a second one.
  - **Existing tests assert hardcoded English text everywhere** (~200
    tests across every phase file), and this feature's Hungarian default
    would have broken all of them. Rather than rewriting every assertion,
    the shared `withPage()` helper (`tests/lib/page.mjs`) gained a
    `lang: "en"` default parameter that pins English for every test in the
    suite except the new `tests/localization.spec.mjs` itself (which
    passes `lang: null` to see the app's real default and exercise the
    toggle on purpose). The two other files with their own hand-rolled
    page lifecycle (`tests/phase5.spec.mjs`'s `withDownloadPage`,
    `tests/phase7.spec.mjs`'s `withFolderPage`) were patched the same way.
  - **Found and fixed a real, intermittent (~15-20% of runs) regression
    during this pass — but traced it to a pre-existing Chromium/Playwright
    hazard, not new application code.** The initial English-pin used
    `page.addInitScript(() => localStorage.setItem("kg-lang","en"))`,
    which intermittently caused a `page.reload()` immediately afterward to
    restore an *empty* graph even though Tier 1 storage had just been
    confirmed saved (`storage.whenIdle()` resolved first). Proved via
    `git stash`/`git stash pop` A/B testing that this reproduced
    identically on unmodified `main` as long as *any* `addInitScript`
    wrote to `localStorage` (even an unrelated key) before a reload — 3-4
    failures per 20 runs both with and without the localization changes,
    0 failures per 20 with no `addInitScript` at all or with a no-op one.
    Root cause: `addInitScript` re-runs on every navigation including
    `page.reload()`, and a `localStorage` write injected at that early,
    pre-navigation point races with Chromium's own `localStorage`
    rehydration for `file://` origins — occasionally starting the new
    document from an empty in-memory map, applying the injected write on
    top of it, and persisting that (now missing the app's own prior save)
    back to disk. This is a test-infrastructure hazard specific to
    `addInitScript` + `file://` + reload, not a bug in the app's Tier 1
    code. **Fix:** all three helpers now pin the language via
    `page.evaluate(() => window.__kg.lang.toggle())` *after*
    `window.__kg` exists (i.e. after the page's own script has already
    run), the same mechanism a real user's click would use — proven
    stable across a 25-iteration stress run with zero failures, vs. the
    ~20% failure rate of the `addInitScript` approach at the same sample
    size.
  - Wrote `tests/localization.spec.mjs` (14 tests). Ran the full suite
    repeatedly during the regression hunt (not just once at the end):
    `node --test tests/*.spec.mjs` (228 tests, run twice consecutively to
    confirm the reload-hang fix actually holds, not just a lucky single
    pass) and `python3 -m unittest discover -s tools -p "test_*.py"`
    (15 tests), both green — no regressions in any earlier phase or
    out-of-spec feature.
- 2026-07-26 — Two more user-requested changes implemented in `index.html`:
  a rename-field positioning fix, and a group-move behavior change with a
  new visual-hue feature.
  - **Rename-field positioning.** The rename field previously anchored to
    the raw screen coordinate of whatever click/tap triggered it
    (`e.clientX`/`e.clientY` at double-click time). For a large or
    heavily-zoomed node, double-clicking near a corner — still squarely on
    the node, just not centered — popped the field up far from the node's
    own rendered label, which read as arbitrary rather than anchored to
    anything. Fixed by having `beginRenameNodePrompt`/`beginRenameEdgePrompt`
    compute their own anchor from the node/edge's *current* geometry
    (`worldToScreen(node center)` / curve midpoint) instead of accepting a
    `screenPos` parameter at all — the same thing the selection toolbar's
    rename button already did, so double-click and the touch-equivalent
    button are now provably the same code path rather than two
    independently-written approximations of it. Separately added
    `clampCenterToViewport()` inside `showInlineInput()`, re-measuring the
    field's real laid-out size once it's actually in the DOM (so the min-
    width CSS and padding are accounted for, not guessed) and clamping its
    center to stay fully on-screen and below the toolbar overlay — a node
    dragged close to a window edge no longer produces a rename field that's
    partly invisible. Verified visually via screenshots (a heavily-zoomed
    node's corner double-click now anchors dead-center on the node; a node
    dragged under the toolbar now clamps below it) as well as with new
    tests. Wrote 6 new tests in `tests/rename.spec.mjs` (10 → 16).
  - **Group move: rigid-body drag.** Dragging a group (not its resize
    handle) now moves every currently-contained member by the exact same
    delta — recursively, so a member of a nested member group moves too
    when the outermost group is dragged. Implemented via a new
    `collectContainedDescendants(groupId)` helper (BFS over `groups[]`
    membership edges) called from the existing `moveNode` pointer-drag
    handler, which was changed from an absolute position assignment to a
    delta-based one specifically so the same per-frame delta could be
    reapplied to every descendant. Resizing is completely unaffected (still
    never moves or cascades to members, per Section 4.3). Membership
    commit/release logic itself (`updateGroupMembership`/
    `updateMembershipForMovedGroup`) is untouched — it still runs once at
    drag-end exactly as before; the only change is that a member's
    position now tracks the group throughout the drag, so by construction
    it's always still exactly where it needs to be for that end-of-drag
    check to keep finding it contained.
    - **This is a second reversal of the "does a group's own drag cascade
      membership" decision** (see the two dated Log entries above): the
      first round made a group's own drag absorb newly-overlapped nodes
      *and* release members it moved away from, symmetric with a member's
      own drag. A rigid-body move makes the "release by moving away" half
      physically unreachable — a member welded to the group's own motion
      can never lose overlap with it through the group's drag alone. Found
      via the full regression suite, not by inspection: two tests in
      `tests/phase2.spec.mjs` that asserted the old "drag group away
      releases the member" behavior started failing the moment the rigid-
      body cascade was wired in, which is exactly the expected, correct
      consequence of the change rather than a bug — both tests were
      rewritten (not just deleted) to assert the new behavior, and a third,
      still-technically-passing-but-now-inaccurately-worded test ("partial
      overlap after a group drag keeps membership") was also rewritten,
      since a group's own drag can no longer produce partial overlap for
      an existing member at all (translation preserves full containment).
      Absorbing previously-unrelated nodes the group's new position now
      covers is unaffected either way, since those nodes don't move.
  - **Group-membership visual hue + move/resize highlight.** Any
    non-group node currently listed in a group's membership now renders
    with a distinct fill/stroke color (new `--member-fill`/`--member-stroke`
    theme tokens, both themes), independent of selection — membership is
    now visible at a glance instead of only inferable from nesting. A
    group being actively dragged gets a temporary highlight that differs
    between a live move (`--group-move-stroke`, violet) and a live resize
    (`--group-resize-stroke`, cyan), checked in `drawNodes()` against the
    existing `dragMode`/`movingNodeId`/`resizingNodeId` drag-state
    variables and taking priority over the ordinary "selected" blue while
    that specific drag is in flight — reverting to the normal look the
    instant the pointer is released. Exposed a new
    `window.__kg.getNodeVisualState(nodeId)` test hook mirroring the exact
    same `isMember`/`isBeingMoved`/`isBeingResized` logic `drawNodes()`
    uses, so tests can assert the color-selection decision directly
    (including the moment mid-drag, which a screenshot can't reliably
    catch) — complemented by one true pixel-sampling test (`getImageData`,
    same technique as the theme toggle's tests) proving the member hue
    actually reaches a real Canvas2D fill, not just the selection logic.
    Verified visually via screenshots (member node green-tinted, group
    border violet while moving, cyan while resizing).
  - Wrote a new `tests/group-move.spec.mjs` (9 tests) and rewrote 3 tests
    in `tests/phase2.spec.mjs` (22 tests total, same count — replacements,
    not additions) for the rigid-body reversal. Ran the full suite
    repeatedly during development, not just once at the end (the phase2
    regressions were caught this way): `node --test tests/*.spec.mjs`
    (243 tests, run twice consecutively) and `python3 -m unittest discover
    -s tools -p "test_*.py"` (15 tests), both green — no regressions in
    any earlier phase or out-of-spec feature.
- 2026-07-26 — User-requested QA pass ("extensive visual and functional
  testing... if you find anything, fix"). Not a feature request — pure bug
  hunting, done by scripting real interaction sequences against the live
  app (screenshots + `window.__kg` introspection) rather than by reading
  code, specifically targeting recently-changed areas and the interactions
  between them. Found 3 real, related bugs, all pre-existing (none
  introduced by any earlier phase/feature in this project — this was the
  first time this exact interaction was ever exercised, by a test or
  otherwise). All three live in `index.html`'s primary pointer-handling
  code (canvas `pointerdown`/`pointermove`/`pointerup`/`pointercancel`) and
  the separate touch-pinch listener beneath it:
  1. **A pinch interrupting a drag silently discarded whatever had already
     moved/resized.** Reproduced first as a direct repro script (drag a
     node, then dispatch a second touch's `pointerdown`), confirmed via
     `window.__kg.history.past.length` staying unchanged even though
     `state.nodes[0].x/y` had visibly moved — an edit that was live in
     `state` but permanently un-undoable and would vanish on the very next
     save/reload with no trace. Root cause: the pinch-start handler (and
     `pointercancel`) just set `dragMode = null` and friends directly,
     with no `pushHistory()` call. Fixed with a new `abortActiveDrag()`
     that commits whatever changed (including a group's cascaded member
     move and its membership recompute) exactly like an ordinary drag
     release, and is a true no-op if nothing had moved yet (checked via a
     `JSON.stringify` diff against the drag's own `dragBeforeSnapshot`,
     not a screen-distance heuristic, since an interruption has no
     "current pointer position" to measure a heuristic against).
  2. **A deeper, related bug found while building a *correct* repro for
     #1 with real touch semantics** (two independent touch pointers, not a
     mouse+touch mix): dispatching a second finger's `pointerdown` mid-drag
     showed `dragMode` had already flipped from `"moveNode"` to `"pan"`
     *before* `abortActiveDrag()` even ran — because the second pointer's
     own `pointerdown` reaches the app's *main* hit-testing handler first
     (registered before the pinch-recognition listener), and that handler
     had no concept of "an interaction is already active," so it happily
     started a brand-new one (a pan, since the second finger's tap point
     was empty canvas) using the second pointer's own coordinates,
     clobbering the first pointer's still-active drag state out from under
     it. Fixed with a new `activePointerId` tracker: pointerdown now
     ignores any pointer that isn't the one already driving an active
     interaction, and pointermove/pointerup were given the same guard
     (generalizing the `pan` mode's pre-existing `panPointerId` check to
     every drag mode) so a second pointer's later move/up events can't
     interleave with or prematurely terminate the first pointer's drag
     either.
  3. **A third, independently-found bug in the same area**: a pinch
     starting didn't cancel a pending 600ms long-press-delete timer, so a
     user who began a long-press then added a second finger to pinch
     instead would still have that node (or edge) deleted out from under
     them well after they'd moved on — reproduced by waiting past the
     600ms threshold post-interruption and observing the node count drop
     to 0. Fixed by having `abortActiveDrag()` clear `longPressTimer` as
     its first action (and simplified `pointercancel`, which had its own
     separate copy of the same clear, to just call `abortActiveDrag()`
     now that it owns this responsibility centrally).
  - Also explored, found no bugs, but the exploration is now locked in as
    a permanent regression test since it was genuinely under-tested: a
    node that's a member of two overlapping groups, where only one of the
    two is dragged — confirmed the end-of-drag membership recompute
    correctly re-evaluates the node's *other* (stationary) group
    membership against its new position too, not just the group that
    moved, releasing it from the one it physically left behind while
    keeping it in the one that carried it along. Also spot-checked (no
    bugs found, not turned into new tests beyond what already existed):
    parallel/bent edges continuing to render correctly through a group
    move, the member-hue color in light theme, keyboard input (Delete/
    Backspace) while a rename field is focused not leaking through to the
    canvas's own shortcuts, and rename-field positioning at extreme
    zoom-out.
  - Wrote a new `tests/pointer-interrupt.spec.mjs` (8 tests) plus 1 new
    test in `tests/group-move.spec.mjs` (10 tests total). Ran the full
    suite repeatedly during the fix (not just once at the end, since the
    second bug was found while writing the repro for the first one):
    `node --test tests/*.spec.mjs` (252 tests, run twice consecutively)
    and `python3 -m unittest discover -s tools -p "test_*.py"` (15 tests),
    both green — no regressions in any earlier phase or feature.
- 2026-07-26 — Follow-up user request: "DO enhance the test suite" (after
  a "what is our test coverage now" question). Surveyed `index.html` and
  the existing suite for genuinely under-tested areas — interactions
  between features and error-handling paths, specifically — rather than
  re-testing what already had solid coverage. Added 4 new tests across 3
  existing files plus 2 more in `pointer-interrupt.spec.mjs`, and found one
  more real, pre-existing bug in the process:
  - **`updateGroupMembership()` redundant-ancestor-membership bug.**
    While writing a test for "drag a group that already has its own
    nested member into a bigger outer group," the nested member ended up
    with `groups: ['innerId', 'outerId']` — a second, direct membership in
    the *outer* group, plus a redundant second `contains` edge — instead
    of staying purely nested through Inner alone. Root cause: the
    function's "find a new candidate group" loop only excludes candidates
    the node is *already a direct member of*; it doesn't know a candidate
    might be a bigger ancestor of a group the node is already nested in,
    so once Inner (already excluded, being an existing membership) drops
    out of consideration, Outer looks like an unrelated, legitimate new
    candidate and gets added too. Fixed by additionally skipping any
    candidate that fully contains one of the node's *existing* kept
    memberships — verified this doesn't regress the legitimate
    "member of two separate, merely-overlapping (non-nested) groups" case,
    since neither of those groups contains the other, so the new check
    never fires for it. This was reachable before the rigid-body group-
    move feature too (in principle, via `updateMembershipForMovedGroup`'s
    per-other-node loop), but the rigid-body move made it easy to trigger
    reliably (a nested member's position is now *guaranteed* to land
    inside the new outer group's box every time, rather than only
    coincidentally).
  - Other areas explored, no bugs found, added as new coverage rather than
    just spot-checked: long-pressing a *group* node (with a member) via
    touch — same cleanup as keyboard Delete, now proven through the real
    touch-drag code path rather than only the keyboard path; a
    `localStorage.setItem` write throwing (not just a corrupted payload on
    *load*, which was already covered) doesn't crash the app or hang
    `whenIdle()` forever; a genuine `pointercancel` DOM event (dispatched
    directly, not synthesized via a second finger) exercises the same
    `abortActiveDrag()` path as the pinch-interrupt fixes above, including
    for a *pan* specifically (which has no undo history at all — confirmed
    a cancelled pan cleanly releases `dragMode`/`activePointerId` so a
    fresh drag afterward works normally, not left in a stuck state).
  - Also fixed an unrelated git-hygiene issue at the user's explicit
    request: the branch tip (a merge commit GitHub itself authored when
    merging PR #17, committer `noreply@github.com`) showed as "Unverified"
    on GitHub. Amended just that commit's author/committer metadata to
    `Claude <noreply@anthropic.com>` and force-pushed — scoped entirely to
    this project's own `claude/todo-first-step-44a4p1` branch, never to
    `main` itself, so no shared/published history on `main` was rewritten.
  - Ran the full suite repeatedly during development. Also independently
    confirmed one single-run flake in the pre-existing
    `tests/parallel-edges.spec.mjs` (unrelated file, untouched this
    session) reproduces at the same low rate on a clean `git stash` of
    this session's own changes — pre-existing environmental flakiness, not
    a regression from this pass. `node --test tests/*.spec.mjs` (257
    tests, run clean twice consecutively after isolating the flake) and
    `python3 -m unittest discover -s tools -p "test_*.py"` (15 tests),
    both green — no regressions in any earlier phase or feature.
- 2026-07-26 — User asked for a plan (no implementation) of what's complex
  and under-tested; then asked to implement the two highest-priority
  findings plus a new end-to-end workflow test. Both findings were
  verified against the actual code before implementing (not assumed from
  the plan alone):
  - **`commitTxtImport()`'s redundant-ancestor contains-declaration bug**
    (the plan's #1). Verified the drag-based fix from PR #18
    (`updateGroupMembership()`) is a *separate* code path from TXT import's
    own `contains`-declaration handling, which pushes directly into
    `member.groups` with no equivalent guard at all. Confirmed via a direct
    repro (a hand-built TXT file declaring both `Outer -> Leaf : contains`
    and `Inner -> Leaf : contains`, with Inner itself declared nested in
    Outer) that Leaf ended up with `groups: ['Inner', 'Outer']` plus a
    redundant second `contains` edge — the exact bug PR #18 fixed for
    drag-based membership, reachable again through the import path. Fixed
    by building the declared (plus pre-existing) group-to-group nesting
    graph up front from the whole file, then skipping any `contains`
    declaration that's just a bigger ancestor of a group the target is
    already known to be nested in — computed independently of the order
    lines happen to appear in the file (confirmed by testing the same file
    with its lines reordered and getting an identical result), unlike the
    drag-based fix, which has real node geometry to check against instead.
  - **OPFS write-failure resilience** (the plan's #2 — a coverage gap, not
    a bug: the localStorage write-failure test added in the prior pass had
    no OPFS equivalent). Added on the served/http test setup, monkey-
    patching `navigator.storage.getDirectory()` to throw only *after* the
    backend was already detected and cached from an earlier settled save —
    so the induced failure hits only `writeGraphPayload()`'s own later
    call, never backend detection itself. Confirmed the app doesn't crash,
    `whenIdle()` still resolves, and a later successful save/reload
    round-trips correctly — no bug found, coverage gap closed as planned.
  - **New `tests/end-to-end-workflow.spec.mjs`** — the user's third ask,
    a single long realistic session (rename graph → toggle theme/language
    → build a group with committed members → parallel edges → rename via
    double-click → rigid-body group move → resize → autolayout → Save
    Version → undo/redo three steps and back → reload → TXT import merge
    → Clear → undo) verifying real invariants at every step, not just
    "didn't crash." This is a deliberate one-off exception to the rest of
    the suite's small-focused-test convention, called out explicitly in
    "Testing Strategy" so it doesn't read as an accidental one-file-does-
    everything sprawl. Caught two of its own bugs during development (both
    fixed in the test, not the app): a containment check needed the same
    floating-point epsilon tolerance `phase8.spec.mjs` already uses instead
    of strict `<=`/`>=`; and `state.meta` is lazily `null` until the very
    first Save Version, which the version-counter assertion needed to
    handle rather than assuming a `0` starting value existed already.
  - Wrote 3 new tests in `tests/phase6.spec.mjs` (22 → 25), 1 new test in
    `tests/phase4.spec.mjs` (15 → 16), and the 1-test
    `end-to-end-workflow.spec.mjs`. Ran the full suite repeatedly during
    development (the end-to-end test's own two bugs were both caught this
    way, immediately, not discovered later): `node --test
    tests/*.spec.mjs` (262 tests, run clean twice consecutively) and
    `python3 -m unittest discover -s tools -p "test_*.py"` (15 tests),
    both green — no regressions in any earlier phase or feature.
- 2026-07-26 — User asked to go back to the "what's complex and
  under-tested" plan and implement everything marked "high" or "medium"
  priority that wasn't already done (the plan's top two items — the TXT
  import bug and OPFS coverage — were already implemented in the previous
  round). Six items closed out, one per remaining plan bullet, each in the
  test file its topic already lived in:
  - **Compounding storage failures** (`phase7.spec.mjs`): induced a Tier 2
    folder-write failure and a Tier 1 `localStorage` write failure from the
    same Save Version click, simultaneously. No bug — Tier 2's existing
    fallback-to-download and Tier 1's independent try/catch don't interact
    badly; both resolve, the in-memory graph survives, and a later save
    with both failures lifted persists correctly.
  - **Autolayout under adversarial graphs** (`phase8.spec.mjs`, 4 tests): a
    3-cycle, an 8-node/28-edge all-pairs-connected graph, a 10-member
    group crammed into a small box all pulled the same direction, and a
    mixed graph combining disconnected islands + a floating group + 3
    levels of nesting. No bug — the force-directed simulation's per-
    iteration clamp holds regardless of graph shape, and all-pairs
    repulsion keeps even 28 competing pulls from collapsing any two nodes
    onto the same point.
  - **Parallel edges beyond 3** (`parallel-edges.spec.mjs`): 5 edges
    between the same pair. No bug — `computeEdgeBendInfo()`'s
    `step = index - (count-1)/2` formula generalizes cleanly past 3 (steps
    -2,-1,0,+1,+2), verified as *signed* perpendicular offsets against the
    exact `EDGE_BEND_STEP` constant, not just "5 different distances," and
    all 5 curves stayed individually hit-testable — the scenario most
    likely to break first at higher multiplicity, and it didn't.
  - **Heterogeneous undo/redo stress** (`phase3.spec.mjs`): a 9-step
    sequence (group create, membership-committing drag, resize, rename,
    plain add, connect, rigid-body group move carrying the renamed member
    along, delete) with a full snapshot recorded after *every* step, then
    undone one at a time checked against each snapshot in reverse, then
    redone forward checked again. No bug — the snapshot-based undo system
    (Phase 3's original design decision, chosen specifically to be
    correct-by-construction regardless of what mutated) held up exactly
    across every one of the 9 steps, including the two newest, most
    structurally different action types (rigid-body group move and
    resize) it had never been stress-tested alongside heterogeneous
    neighbors before.
  - **`abortActiveDrag()`'s diff cost at 1,000 nodes**
    (`pointer-interrupt.spec.mjs`): a pinch interrupting a drag on the same
    scale `phase9.spec.mjs` already uses for render/culling stress-testing.
    No bug — `commitDragIfChanged()`'s `JSON.stringify`-based before/after
    diff resolved well within a generous time budget, correctly, every
    time.
  - **Rename-field anchoring under zoom + pan-near-edge + group membership,
    combined** (`rename.spec.mjs`): a group member zoomed in ~3.3x and
    panned until its true (unclamped) center was genuinely off-screen to
    the left, with only a sliver of its (now huge) box still visible. No
    bug — the field opened correctly pre-filled, `clampCenterToViewport()`
    still kept it fully on-screen and clear of the toolbar, and the rename
    committed correctly with membership intact. (This test's own pan
    distance needed tuning twice during development — first too short to
    push the center off-screen at all, second requiring the *opposite*
    correction to keep enough of the member's box on-screen for the
    double-click to still land on it — a test-authoring detail, not an
    app issue, caught immediately by real runs each time.)
  - Every one of these 9 new tests passed on its first real run with no
    application code changes — a genuinely different outcome from the
    prior three QA/coverage rounds in this project, each of which found at
    least one real bug. Ran the full suite repeatedly regardless (the
    rename test's own tuning needed two more runs to get right):
    `node --test tests/*.spec.mjs` (271 tests, run clean twice
    consecutively) and `python3 -m unittest discover -s tools -p
    "test_*.py"` (15 tests), both green — no regressions in any earlier
    phase or feature.

---

## Open Questions (not yet decided — raise before implementing that part)

- ~~Exact autolayout algorithm choice (Phase 8) — spec leaves this open.~~
  — resolved in Phase 8: force-directed (Fruchterman-Reingold style)
  relaxation over node centers, chosen because it needs no "root"/"levels"
  concept and degrades gracefully for arbitrary, possibly-cyclic,
  possibly-disconnected graphs. See the Phase 8 Log entry for the full
  rationale.
- ~~Graph name (Section 5.4)~~ — resolved in Phase 5, via a direct question
  to the user rather than a unilateral pick: an always-visible, always-
  editable title in the toolbar (click to rename, defaults to "Untitled
  Graph"), stored in `state.graphName` and persisted via Tier 1 — *not*
  gated behind Save Version at all. (An initial implementation used a
  one-time prompt on first save instead; revised after the user was asked
  and picked the always-visible title. See the Phase 5 Log entry.)
