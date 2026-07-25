# Knowledge Graph Canvas — Technical Specification

**Status:** v1.0 — Finalized
**Target:** Single portable HTML file, no build step, no external server required
**Confirmed platforms:** Chrome (Windows), Chromium/Brave (Linux), Chrome (Android)

---

## 1. Purpose & Scope

A single-file, offline-first visual editor for building small-to-medium knowledge graphs / ontologies by hand: draggable entity boxes, labeled directional or bidirectional relations, and recursive/overlapping grouping — with fast infinite-zoom canvas interaction and explicit, user-controlled export/import to versioned files on disk in two formats (JSON canonical + plain-text edge list).

Typical usage is graphs in the low hundreds of nodes; the app is engineered for headroom up to ~1,000 nodes (Section 6). The graph is not required to be a single connected structure — small disconnected snippets, standalone groups, and isolated entities coexisting on the same canvas is normal, expected usage, not an edge case.

This is a personal authoring tool, not a collaborative multi-user system, and not a replacement for a real triple store. It's meant to sit upstream of your GraphRAG/n8n pipelines: sketch an ontology by hand, quickly, then export in a form immediately usable by scripts or fed to an LLM — or edit the structure directly as text and bring it back in.

---

## 2. Design Principles (confirmed)

- **Single HTML file.** All HTML/CSS/JS inlined. No install, no build step. Opens directly in a browser.
- **No implicit layout.** Nodes stay exactly where placed. Autolayout exists only as an explicit, undoable action — never runs automatically.
- **Manual save, not silent background sync.** Disk persistence is an explicit user action ("Save Version"), never continuous or invisible. In-app state is never lost between explicit saves (Section 3.2, Tier 1), but *file* versions are created only when asked for.
- **Dual export format, bidirectional for TXT.** Every explicit save writes both a JSON file (canonical, full-fidelity) and a TXT file (plain edge list). The TXT format can also be edited externally and re-imported (Section 5.3).
- **Buttons are the primary control surface.** Every core action is reachable via an on-screen button; gestures exist as accelerators for direct-manipulation actions (move, connect, group, pan, zoom) but are never the *only* path to an action.
- **No assumption of connectivity.** The canvas and both file formats handle disconnected components, floating groups, and isolated nodes as first-class, unremarkable cases.

---

## 3. Platform Support & Storage Architecture

### 3.1 Platform capability matrix

Verified against current (2026) browser behavior for the three confirmed target environments:

| Capability | Chrome (Windows) | Chromium (Linux) | Brave (Linux) | Chrome (Android) |
|---|---|---|---|---|
| `showDirectoryPicker` (live, silent, repeated writes to a real folder) | ✅ | ✅ | ❌ *(blocked by default — see note)* | ❌ |
| `showSaveFilePicker` (one-shot native save dialog) | ✅ | ✅ | ❌ | ❌ |
| OPFS (fast sandboxed local storage) | ✅ | ✅ | ✅ | ✅ |
| `<a download>` triggered download | ✅ | ✅ | ✅ | ✅ |

**Brave note:** despite being Chromium-based, Brave deliberately disables the File System Access API (`showDirectoryPicker`/`showSaveFilePicker`) by default as a privacy hardening measure, with no user-facing toggle to re-enable it in the standard build (confirmed via multiple open Brave GitHub issues, unresolved as of 2025). Treat Brave as **Tier 3-only**, same as Android — do not rely on Tier 2 there.

**Conclusion:** Tier 2 (live silent folder sync) is available on Chrome/Windows and vanilla Chromium/Linux. Brave/Linux and Chrome/Android always fall back to Tier 3 (explicit export/import via native save-download and file-open dialogs), which is fully functional on all four target combinations.

### 3.2 Three-tier storage model

**Tier 1 — Live engine (all platforms, always on).**
Every edit (add/move/connect/group/delete) writes immediately to OPFS in the background — instant, no prompts, protects against a crashed tab or dropped tablet. Not a user-visible file.

**Tier 2 — Live folder sync (Chrome/Chromium desktop only, progressive enhancement).**
Optionally, the app may request a real folder via `showDirectoryPicker({mode: 'readwrite'})`. Once granted, explicit saves write silently into that folder with no further prompts. Not available on Brave or Android — the app must work fully without it.

**Tier 3 — Explicit versioned export/import (all platforms, the confirmed baseline).**
"Save Version" bundles the current state into two files (`.json` + `.txt`, Section 5.4) and triggers a native save/download. "Import from TXT" opens a native file picker (or accepts drag-drop where supported) and merges or replaces graph structure from a `.txt` file (Section 5.3). This is the universal path — it is what makes the tool work identically on Android and desktop.

---

## 4. Data Model

### 4.1 Node

| Field | Type | Notes |
|---|---|---|
| `id` | string | stable unique id, never reused |
| `label` | string | entity name, shown in the box — also the matching key for TXT import (Section 5.3) |
| `type` | `"entity"` \| `"group"` | a group is itself an entity |
| `x`, `y` | number | top-left position in canvas space |
| `w`, `h` | number | box dimensions |
| `groups` | string[] | ids of all groups this node currently belongs to — supports overlapping membership |
| `boundary_mode` | `"manual"` | groups only; groups do not auto-fit to members (Section 4.3) |
| `notes` | string \| null | free-text, optional |

### 4.2 Edge

| Field | Type | Notes |
|---|---|---|
| `id` | string | stable unique id |
| `source` | node id | |
| `target` | node id | |
| `relation` | string | the label |
| `directed` | boolean | `true` = single arrowhead source→target. `false` = no direction specified → bidirectional, rendered as a plain line with **no arrowheads at either end** |
| `auto` | boolean | `true` only for system-generated `contains` edges; these are never hand-created or hand-deleted as ordinary edges |

### 4.3 Group semantics

- A group is a node (`type: "group"`) with its own id, label, position/size, and can itself belong to other groups (recursive) or be the source/target of ordinary relations.
- **Membership is directional-by-action, not geometric.** Membership is granted only by dragging the smaller (member) box into the larger (group) box; dropping inside commits membership. The reverse action — moving or resizing the group box so that it now visually overlaps other boxes — does **not** auto-include them. Membership never gets silently recomputed from overlap after the fact.
- Group boundaries can overlap freely on canvas, and a node can belong to any number of groups simultaneously.
- `boundary_mode` is always `"manual"`: the group's box is independently resizable and never auto-fits to its members' positions.
- Every membership generates exactly one automatic edge: `{source: group_id, target: member_id, relation: "contains", directed: true, auto: true}`. This edge exists in the data model and in both export formats but is **not** drawn as a visible arrow on canvas — containment is communicated purely by visual nesting, avoiding arrow clutter on groups with many members.

---

## 5. File Formats

### 5.1 JSON (canonical, full-fidelity)

The source of truth. Contains everything needed to fully reconstruct the canvas exactly as left, including positions and group boundaries.

```json
{
  "meta": {
    "format_version": 1,
    "graph_id": "b3f1b2b0-...",
    "version": 42,
    "created": "2026-07-20T09:00:00Z",
    "saved": "2026-07-25T14:20:00Z"
  },
  "nodes": [
    {
      "id": "n1",
      "label": "Andhra Pradesh",
      "type": "entity",
      "x": 120, "y": 340, "w": 160, "h": 60,
      "groups": ["g1"],
      "notes": null
    },
    {
      "id": "g1",
      "label": "South Asian Languages",
      "type": "group",
      "x": 80, "y": 300, "w": 420, "h": 240,
      "groups": [],
      "boundary_mode": "manual"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2",
      "relation": "language used",
      "directed": true,
      "auto": false
    },
    {
      "id": "e2",
      "source": "g1",
      "target": "n1",
      "relation": "contains",
      "directed": true,
      "auto": true
    }
  ]
}
```

### 5.2 TXT edge list (portable, structure-only, human/Python-editable)

Designed to be hand-editable in any text editor and trivially parseable in Python with no dependencies. Positions and box sizes are deliberately omitted — this format captures graph *structure* only.

Grammar:
- Lines starting with `#` are comments/metadata, ignored by parsers.
- `## NODES` section: one entity name per line. Groups are suffixed with ` [group]`.
- `## EDGES` section: one relation per line:
  - `Source -> Target : relation label` (directed)
  - `Source <-> Target : relation label` (bidirectional / no direction specified)
- Names must not contain the literal substrings `->`, `<->`, or ` : `.
- `contains` edges are included like any other edge, so containment survives into the flat export and is editable the same way (see 5.3).

Example:

```
# KG Canvas export
# format_version: 1
# graph_id: b3f1b2b0-...
# version: 42
# saved: 2026-07-25T14:20:00Z

## NODES
Andhra Pradesh
Telugu
Marathi
South Asian Languages [group]
Guatemala
European Union

## EDGES
South Asian Languages -> Andhra Pradesh : contains
Andhra Pradesh -> Telugu : language used
Andhra Pradesh -> Marathi : language used
Guatemala <-> European Union : diplomatic relation
```

This is intentionally the same shape as the "List of Edges" textualization format from our earlier discussion — the fastest and most token-efficient format in the KG-LLM-Bench comparison — so this export can go straight into an LLM context or your extraction/RAG pipeline without reformatting.

### 5.3 TXT import (re-import, confirmed required feature)

Triggered via an explicit "Import from TXT" button (native file-open dialog, or drag-and-drop of a `.txt` file onto the canvas as an accelerator). Two modes, both applied as a single undoable action:

- **Merge (default, safe).** Diffs the imported file against the current graph, matched by `label` (case-sensitive) and `type`:
  - Nodes present in the TXT but not in the current graph are **created**, auto-placed in an unused region of the canvas (simple shelf/grid placement — not full autolayout), and flagged as newly added for easy visual identification.
  - Nodes already present (label match) **keep their existing position, size, and group boundaries untouched.**
  - Edges present in the TXT but missing from the graph are **added.**
  - Edges present in the graph but missing from the TXT are **left alone, not deleted.** Merge is additive/updating only — it never removes anything.
  - Lines of the form `GroupLabel -> MemberLabel : contains` are **not** created as ordinary edges. They are interpreted as group-membership declarations: the member node's `groups` list is updated to include the group, exactly as if it had been dragged in on canvas. This preserves the invariant that `contains` edges are always derived from membership, never freeform.
- **Replace (explicit, destructive).** Same diffing, but edges/nodes present in the current graph and absent from the TXT are removed. Requires a confirmation step that summarizes the diff (N added, N removed, N unchanged) before committing. Undoable in one step regardless of size, same as autolayout.

**Known limitation (inherent to a labels-only, ID-less format):** because matching is by label text, renaming a node in the text editor is indistinguishable from deleting the old node and creating a new one — the renamed node will lose its saved position and be re-placed as if new. This is a structural property of the format, not a bug; worth remembering when hand-editing.

### 5.4 Versioned filename convention

```
<graph-name>_v<0000>_<UTC-timestamp>.json
<graph-name>_v<0000>_<UTC-timestamp>.txt
```

Example: `frankfurt-ai-ontology_v0042_2026-07-25T1420Z.json` and the matching `.txt`. Both files are always written together on every explicit save.

---

## 6. Canvas & Rendering

- **Renderer:** Canvas2D (not DOM/SVG), driven by a single camera transform (pan offset + zoom scale) applied per frame.
- **Zoom:** continuous, effectively unbounded in both directions (practical clamp at extreme values to avoid float precision issues, e.g. 0.01×–100×).
- **Performance target:** smooth interaction (60fps drag/pan/zoom) up to ~1,000 nodes, with typical real-world usage in the low hundreds. Viewport culling (only draw/hit-test what intersects the visible camera rect) is sufficient at this scale without a spatial index; a quadtree can be added later without any format or interaction changes if real usage exceeds this comfortably.
- **Disconnected layouts:** the camera and culling logic make no assumption of a single connected component — scattered snippets and floating groups render and pan/zoom identically to a single connected graph.
- **Redraw model:** dirty-flag driven `requestAnimationFrame` — redraw only on interaction, not a constant loop, to conserve battery on tablet.

---

## 7. Interaction & Gestures

Every action has a button; gestures exist as accelerators where natural.

| Action | Gesture | Button |
|---|---|---|
| Pan | one-finger/mouse drag on empty canvas | — |
| Zoom | pinch (touch) / scroll or ctrl+scroll (desktop) | +/− zoom buttons |
| Add node | double-tap empty canvas → inline name field | "Add Node" button → tap placement point |
| Add edge | drag from a node's edge handle to another node → relation label prompt | "Connect" mode toggle, then tap source, tap target |
| Set edge direction | tap the edge, toggle directed/bidirectional | edge context menu |
| Move node | drag the box | — |
| Add to group | drag the smaller box into/onto the larger box; drop commits membership | "Add to Group" in context menu after selecting both |
| Remove from group | drag the member fully outside the group boundary | "Remove from Group" in context menu |
| Delete node/edge | select + delete key, or long-press → delete | trash icon on selection |
| Undo/redo | — (no dedicated gesture; avoids conflicting with pan/zoom) | Undo/Redo buttons — primary and only path, by design |
| Autolayout | — (deliberately no gesture) | explicit "Auto-layout" button, one undo step |
| Save Version | — | explicit "Save Version" button |
| Import from TXT | drag-and-drop a `.txt` file onto canvas (where supported) | explicit "Import from TXT" button |

---

## 8. Editing Model

- **Default:** zero automatic layout. Every node stays exactly where dragged until moved again.
- **Autolayout:** explicit, opt-in, recorded as a single undo step (one "before" snapshot of all positions, restorable in one undo regardless of how many nodes moved). Algorithm choice (force-directed vs. hierarchical vs. grid) is an implementation detail, not fixed by this spec.
- **Undo/redo:** command-pattern stack in memory, independent of the Tier-1 live-save engine. Every discrete user action (add, move, connect, delete, group, autolayout, TXT import) is one undo step. Not persisted across a full app reload — reload starts a fresh undo stack from the last saved state.

---

## 9. Versioning & Save Behavior

- A file version is created only on explicit "Save Version" action — never per edit, never on a timer.
- Tier 1 (OPFS) protects against data loss between explicit saves; it is not itself a version.
- Version numbers increment monotonically and are stored in graph metadata, continuous across sessions regardless of Tier 2 availability.
- **Retention:** unbounded. The app does not prune old version files — they accumulate in whichever folder they were saved to, and cleanup is a manual file-manager task.

---

## 10. Out of Scope

- Real-time collaboration / multi-user editing
- Concurrent multi-device editing / merge-conflict resolution — explicitly out of scope; the tool assumes one device edits a given graph at a time
- Automatic version pruning or cloud sync
- OWL/RDF reasoning, validation, or consistency checking (this is a sketching tool, not a formal ontology editor)
- Graph library / multi-graph switcher within one app instance (v1 is single-graph-per-session)

---

## 11. Decision Log

| # | Topic | Decision |
|---|---|---|
| 1 | Target platforms | Chrome/Windows, Chromium/Brave on Linux, Chrome/Android. Brave treated as Tier-3-only due to File System Access API being blocked by default. |
| 2 | Group membership mechanic | Explicit drag-small-into-big; commits on drop; never recomputed from later geometry changes. |
| 3 | Group boundary | Always `manual`; groups never auto-fit to members. |
| 4 | Bidirectional edge rendering | Plain line, no arrowheads at either end. |
| 5 | Scale target | Design headroom to ~1,000 nodes; typical real usage in the low hundreds. |
| 6 | Multi-graph / connectivity | Single graph per session; graph is not required to be fully connected — disconnected snippets and floating groups are normal. |
| 7 | Version retention | Unbounded; no automatic pruning. |
| 8 | Undo control | Buttons only, no dedicated gesture. |
| 9 | TXT re-import | Required. Merge (safe, additive) and Replace (destructive, confirmed) modes, label-matched, `contains` lines interpreted as membership. |
| 10 | Concurrent multi-device editing | Out of scope. |

---

## Appendix: Reference Python loader for the TXT format

Demonstrates the format is genuinely trivial to consume externally — no dependencies beyond the standard library. (The app's own TXT import, Section 5.3, additionally performs label-matched merge/replace against existing graph state; this snippet is a minimal read-only reference for external scripts.)

```python
def load_edge_list(path):
    nodes, edges = [], []
    section = None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            # Section headers are checked before the generic "#" comment
            # skip below, since "## NODES"/"## EDGES" also start with "#" —
            # checking the comment rule first would make both headers
            # unreachable and the loader would parse nothing at all.
            if line == "## NODES":
                section = "nodes"
                continue
            if line == "## EDGES":
                section = "edges"
                continue
            if not line or line.startswith("#"):
                continue
            if section == "nodes":
                is_group = line.endswith("[group]")
                name = line[: -len("[group]")].strip() if is_group else line
                if name:
                    nodes.append({"label": name, "type": "group" if is_group else "entity"})
            elif section == "edges":
                if " : " not in line:
                    continue  # malformed — no relation separator, skip
                conn, relation = line.rsplit(" : ", 1)
                if "<->" in conn:
                    directed = False
                    src, tgt = conn.split("<->", 1)
                elif "->" in conn:
                    directed = True
                    src, tgt = conn.split("->", 1)
                else:
                    continue  # malformed — no connector, skip
                src, tgt, relation = src.strip(), tgt.strip(), relation.strip()
                if src and tgt and relation:
                    edges.append({
                        "source": src,
                        "target": tgt,
                        "relation": relation,
                        "directed": directed,
                    })
    return nodes, edges
```

A standalone, tested copy of this loader lives at `tools/load_edge_list.py` (kept byte-for-byte in sync with the snippet above) — see `tools/test_load_edge_list.py`.
