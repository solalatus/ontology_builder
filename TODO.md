# TODO — Knowledge Graph Canvas

Progress tracker for the project defined in `spec.md`. Keep this file up to
date as work happens: check items off, add notes under "Log / Decisions"
when something deviates from spec or gets clarified, and update "Current
State" so the project can be picked up cold at any time.

---

## Current State

- **Phase:** Not started — spec finalized (v1.0), no implementation yet.
- **Target file:** single portable `index.html` (name TBD — not yet created).
- **Next action:** Phase 0 (scaffold) — see below.

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

No build step, no dependencies, no test framework mandated by the spec —
verification is manual (open the file in a target browser and exercise the
feature) unless a phase below says otherwise.

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

- [ ] Create single HTML file with inlined `<style>` and `<script>` blocks
      (no external files, no CDN links — spec Section 2)
- [ ] Canvas2D setup with camera transform (pan offset + zoom scale) —
      Section 6
- [ ] Basic render loop: dirty-flag driven `requestAnimationFrame`, not a
      constant loop — Section 6
- [ ] Empty-state UI shell: button bar per Section 7 (Add Node, Connect,
      Auto-layout, Undo, Redo, Save Version, Import from TXT, zoom +/−)

## Phase 1 — Data model & core node/edge ops

- [ ] Implement Node model (Section 4.1): id, label, type, x/y/w/h, groups[],
      boundary_mode, notes
- [ ] Implement Edge model (Section 4.2): id, source, target, relation,
      directed, auto
- [ ] Add node: double-tap empty canvas → inline name field; also via
      "Add Node" button → tap placement point
- [ ] Move node: drag the box
- [ ] Add edge: drag from node edge handle → relation label prompt; also via
      "Connect" mode toggle (tap source, tap target)
- [ ] Toggle edge direction (directed ↔ bidirectional) via edge context menu
      — bidirectional renders as plain line, **no arrowheads either end**
- [ ] Delete node/edge: select + delete key, or long-press → delete, or
      trash icon on selection

## Phase 2 — Groups

- [ ] Group node type + creation
- [ ] Membership mechanic: drag smaller box into larger box, commit on drop
      (directional-by-action, never recomputed from later overlap) —
      Section 4.3, Decision #2
- [ ] Auto-generate `contains` edge on membership (`auto: true`,
      `directed: true`) — not drawn as visible arrow, containment shown via
      nesting only
- [ ] Remove from group: drag member fully outside group boundary
- [ ] Support recursive membership (group belonging to another group) and
      overlapping membership (node in multiple groups)
- [ ] `boundary_mode` always `"manual"` — group box independently resizable,
      never auto-fits to members — Decision #3

## Phase 3 — Undo/redo

- [ ] Command-pattern undo stack in memory
- [ ] Every discrete action = one undo step: add, move, connect, delete,
      group, autolayout, TXT import
- [ ] Undo/Redo buttons only, no dedicated gesture — Decision #8
- [ ] Confirm: undo stack NOT persisted across reload (reload starts fresh
      from last saved state) — Section 8

## Phase 4 — Tier 1 storage (OPFS live engine)

- [ ] Every edit writes immediately to OPFS in background (add/move/connect/
      group/delete) — no prompts, no visible file
- [ ] On load: restore from OPFS if present (crash/dropped-tab recovery)
- [ ] Verify this works on all 4 target combos (OPFS is universally
      supported per Section 3.1 capability matrix)

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

## Phase 7 — Tier 2 storage (live folder sync, progressive enhancement)

- [ ] Feature-detect `showDirectoryPicker` — offer opt-in only on Chrome/
      Windows and Chromium/Linux (NOT Brave, NOT Android — Section 3.1)
- [ ] On grant, explicit saves write silently into chosen folder, no further
      prompts
- [ ] Confirm app is fully functional with Tier 2 entirely absent (Brave/
      Android path never blocked)

## Phase 8 — Autolayout

- [ ] Explicit "Auto-layout" button only, never automatic (Section 2, 8)
- [ ] Algorithm: implementation detail, not fixed by spec (force-directed /
      hierarchical / grid — pick one, document choice in Log below)
- [ ] Single undo step regardless of node count (one "before" snapshot of
      all positions)

## Phase 9 — Scale & performance

- [ ] Viewport culling (draw/hit-test only what intersects visible camera
      rect) — Section 6
- [ ] Verify smooth 60fps drag/pan/zoom at ~1,000 synthetic nodes
- [ ] Confirm disconnected components / floating groups behave identically
      to connected graphs under pan/zoom/culling

## Phase 10 — Cross-platform verification

- [ ] Chrome / Windows — full Tier 2 path
- [ ] Chromium / Linux — full Tier 2 path
- [ ] Brave / Linux — confirm graceful Tier 3-only fallback, no broken UI
      from absent File System Access API
- [ ] Chrome / Android — touch gestures (pinch zoom, double-tap add,
      long-press delete, drag), Tier 3-only fallback

## Phase 11 — Polish / out-of-scope guardrails

- [ ] No feature creep into: real-time collaboration, concurrent multi-
      device merge, cloud sync, OWL/RDF reasoning/validation, multi-graph
      switcher (all explicitly out of scope — Section 10)
- [ ] Version retention: confirm no auto-pruning exists anywhere in code
      (Decision #7)

---

## Log / Decisions

*(Append dated entries here when something is clarified, changed, or
deviates from spec.md — keep spec.md itself as the frozen v1.0 reference
and record deltas here instead of editing the spec.)*

- 2026-07-25 — TODO.md created. No implementation code exists yet; only
  `spec.md` (v1.0, finalized) is committed. Repo: `solalatus/ontology_builder`
  on `main`, working tree clean at commit `a6091b4` ("initial commit").

---

## Open Questions (not yet decided — raise before implementing that part)

- Exact autolayout algorithm choice (Phase 8) — spec leaves this open.
- Graph name (used in versioned filenames, Section 5.4) — is it user-entered
  at first save, or derived from something else? Spec doesn't say explicitly.
