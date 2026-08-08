# Knowledge Graph Canvas — Technical Specification

**Status:** v1.1 — Finalized, amended (Groups removed — see Decision Log #11)
**Target:** Single portable HTML file, no build step, no external server required
**Confirmed platforms:** Chrome (Windows), Chromium/Brave (Linux), Chrome (Android)

---

## 1. Purpose & Scope

A single-file, offline-first visual editor for building small-to-medium knowledge graphs / ontologies by hand: draggable entity boxes and labeled directional or bidirectional relations — with fast infinite-zoom canvas interaction and explicit, user-controlled export/import to versioned files on disk in two formats (JSON canonical + plain-text edge list).

Typical usage is graphs in the low hundreds of nodes; the app is engineered for headroom up to ~1,000 nodes (Section 6). The graph is not required to be a single connected structure — small disconnected snippets and isolated entities coexisting on the same canvas is normal, expected usage, not an edge case.

This is a personal authoring tool, not a collaborative multi-user system, and not a replacement for a real triple store. It's meant to sit upstream of your GraphRAG/n8n pipelines: sketch an ontology by hand, quickly, then export in a form immediately usable by scripts or fed to an LLM — or edit the structure directly as text and bring it back in.

---

## 2. Design Principles (confirmed)

- **Single HTML file.** All HTML/CSS/JS inlined. No install, no build step. Opens directly in a browser.
- **No implicit layout.** Nodes stay exactly where placed. Autolayout exists only as an explicit, undoable action — never runs automatically.
- **Manual save, not silent background sync.** Disk persistence is an explicit user action ("Save Version"), never continuous or invisible. In-app state is never lost between explicit saves (Section 3.2, Tier 1), but *file* versions are created only when asked for.
- **Dual export format, bidirectional for TXT.** Every explicit save writes both a JSON file (canonical, full-fidelity) and a TXT file (plain edge list). The TXT format can also be edited externally and re-imported (Section 5.3).
- **Buttons are the primary control surface.** Every core action is reachable via an on-screen button; gestures exist as accelerators for direct-manipulation actions (move, connect, pan, zoom) but are never the *only* path to an action.
- **No assumption of connectivity.** The canvas and both file formats handle disconnected components and isolated nodes as first-class, unremarkable cases.

---

## 3. Platform Support & Storage Architecture

### 3.1 Platform capability matrix

Verified against current (2026) browser behavior for the three confirmed target environments:

| Capability | Chrome (Windows) | Chromium (Linux) | Brave (Linux) | Chrome (Android) |
|---|---|---|---|---|
| `showDirectoryPicker` (live, silent, repeated writes to a real folder) | ✅ | ✅ | ❌ *(blocked by default — see note)* | ❌ |
| `showSaveFilePicker` (one-shot native save dialog) | ✅ | ✅ | ❌ | ❌ |
| OPFS (fast sandboxed local storage) | ✅ *(served origins only — see note)* | ✅ *(served origins only)* | ✅ *(served origins only)* | ✅ *(served origins only)* |
| `<a download>` triggered download | ✅ | ✅ | ✅ | ✅ |

**OPFS note (amended after implementation — see TODO.md's Phase 4 Log entry):** this row originally read as unconditional support, which conflicts with §2's promise that the app "opens directly in a browser" with no server. OPFS throws `SecurityError` under a `file://` origin on every one of these browsers, so double-clicking `index.html` — the deployment mode §2 explicitly promises — gets no OPFS at all. The implementation therefore feature-detects OPFS and falls back to `localStorage`, which does work under `file://`. Tier 1 is genuinely always-on in both deployment modes, but via two backends rather than one; see §3.2.

**Brave note:** despite being Chromium-based, Brave deliberately disables the File System Access API (`showDirectoryPicker`/`showSaveFilePicker`) by default as a privacy hardening measure, with no user-facing toggle to re-enable it in the standard build (confirmed via multiple open Brave GitHub issues, unresolved as of 2025). Treat Brave as **Tier 3-only**, same as Android — do not rely on Tier 2 there.

**Conclusion:** Tier 2 (live silent folder sync) is available on Chrome/Windows and vanilla Chromium/Linux. Brave/Linux and Chrome/Android always fall back to Tier 3 (explicit export/import via native save-download and file-open dialogs), which is fully functional on all four target combinations.

### 3.2 Three-tier storage model

**Tier 1 — Live engine (all platforms, always on).**
Every edit (add/move/connect/delete) writes immediately to a private background store — instant, no prompts, protects against a crashed tab or dropped tablet. Not a user-visible file.

The store is OPFS (file `kg-canvas-live.json`) on a served `http(s)` origin, and `localStorage` (key `kg-canvas-live`) under `file://`, chosen once by feature detection at startup — OPFS is unavailable under `file://` (see §3.1's OPFS note). The Helper Agent's conversation is persisted the same way under its own separate file/key (`kg-agent-conversation`), so a large or malformed conversation record can never threaten the graph's own save reliability.

**Tier 2 — Live folder sync (Chrome/Chromium desktop only, progressive enhancement).**
Optionally, the app may request a real folder via `showDirectoryPicker({mode: 'readwrite'})`. Once granted, explicit saves write silently into that folder with no further prompts. Not available on Brave or Android — the app must work fully without it.

**Tier 3 — Explicit versioned export/import (all platforms, the confirmed baseline).**
"Save Version" bundles the current state into three files (`.json` + `.txt` + `.domain.yaml`, Section 5.4) and triggers a native save/download. "Import" opens a native file picker (or accepts drag-drop where supported) and reads back any of the three: the canonical `.json` as a full-fidelity restore (Section 5.5), a `.txt` edge list as a structural merge/replace (Section 5.3), or a `.domain.yaml` domain model (`agent_ontology_spec.md` §11). This is the universal path — it is what makes the tool work identically on Android and desktop.

*(Amended after implementation: this section originally specified two files and TXT-only import. The third file arrived with the Agent Ontology layer — `agent_ontology_spec.md` §5 — and JSON import closed the round trip on the canonical format. See TODO.md's dated Log entries.)*

---

## 4. Data Model

### 4.1 Node

| Field | Type | Notes |
|---|---|---|
| `id` | string | stable unique id, never reused |
| `label` | string | entity name, shown in the box — also the matching key for TXT import (Section 5.3) |
| `x`, `y` | number | top-left position in canvas space |
| `w`, `h` | number | box dimensions — fixed at creation, never independently resized |
| `meaning` | string \| null | free-text, optional. Renamed from `notes` when the Agent Ontology layer wired it up as the per-class meaning field — see `agent_ontology_spec.md` §3, Decision Log #2 |

### 4.2 Edge

| Field | Type | Notes |
|---|---|---|
| `id` | string | stable unique id |
| `source` | node id | |
| `target` | node id | |
| `relation` | string | the label |
| `directed` | boolean | `true` = single arrowhead source→target. `false` = no direction specified → bidirectional, rendered as a plain line with **no arrowheads at either end** |

### 4.3 Group semantics — removed (see Decision Log #11)

This section originally specified a `type: "group"` node variant (independently resizable, recursive membership via drag-into, an auto-generated `contains` edge per membership). **Groups were removed from the app entirely** — every node is now a plain entity, box size is fixed, and there is no membership/containment concept in the data model, the canvas UI, or either file format. See Decision Log entry #11 for the rationale; this section number is kept as a stub (rather than renumbering every section after it) since other parts of this document, and this project's TODO.md, still cross-reference "Section 4.3" in their own historical Log entries.

---

## 5. File Formats

### 5.1 JSON (canonical, full-fidelity)

The source of truth. Contains everything needed to fully reconstruct the canvas exactly as left.

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
      "x": 120, "y": 340, "w": 160, "h": 60,
      "meaning": null
    },
    {
      "id": "n2",
      "label": "Telugu",
      "x": 380, "y": 340, "w": 160, "h": 60,
      "meaning": null
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2",
      "relation": "language used",
      "directed": true
    }
  ]
}
```

**Agent Ontology additions:** since the `agent_ontology_spec.md` initiative shipped, this same JSON export also carries `aliases`/`properties` on each node, `meaning`/`aliases` on each edge, and two additional top-level arrays, `rules`/`actions` — all additive, optional, defaulting to empty/null on load. Omitted from the minimal example above to keep it focused on the base instance-level shape; see `agent_ontology_spec.md` §4 for the full field set.

**`meta.graph_name`:** also additive, added with the JSON import path (§5.5). The graph's display name previously survived only inside the *filename*, which §5.4's sanitization has already reduced to a filesystem-safe form — so a round trip could never restore the name the user actually typed. Optional on read: a file written before this field existed falls back to deriving the name from the filename.

### 5.2 TXT edge list (portable, structure-only, human/Python-editable)

Designed to be hand-editable in any text editor and trivially parseable in Python with no dependencies. Positions and box sizes are deliberately omitted — this format captures graph *structure* only.

Grammar:
- Lines starting with `#` are comments/metadata, ignored by parsers.
- `## NODES` section: one entity name per line.
- `## EDGES` section: one relation per line:
  - `Source -> Target : relation label` (directed)
  - `Source <-> Target : relation label` (bidirectional / no direction specified)
- Names must not contain the literal substrings `->`, `<->`, or ` : `.

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
Guatemala
European Union

## EDGES
Andhra Pradesh -> Telugu : language used
Andhra Pradesh -> Marathi : language used
Guatemala <-> European Union : diplomatic relation
```

This is intentionally the same shape as the "List of Edges" textualization format from our earlier discussion — the fastest and most token-efficient format in the KG-LLM-Bench comparison — so this export can go straight into an LLM context or your extraction/RAG pipeline without reformatting.

### 5.3 TXT import (re-import, confirmed required feature)

Triggered via the explicit "Import" button (native file-open dialog, or drag-and-drop onto the canvas as an accelerator). The same entry point also accepts the canonical `.json` (§5.5) and a `.domain.yaml` domain model (`agent_ontology_spec.md` §11); which importer runs is decided by extension first and content second — see §5.6. Two modes, both applied as a single undoable action:

- **Merge (default, safe).** Diffs the imported file against the current graph, matched by `label` (case-sensitive):
  - Nodes present in the TXT but not in the current graph are **created**, auto-placed in an unused region of the canvas (simple shelf/grid placement — not full autolayout), and flagged as newly added for easy visual identification.
  - Nodes already present (label match) **keep their existing position untouched.**
  - Edges present in the TXT but missing from the graph are **added.**
  - Edges present in the graph but missing from the TXT are **left alone, not deleted.** Merge is additive/updating only — it never removes anything.
- **Replace (explicit, destructive).** Same diffing, but edges/nodes present in the current graph and absent from the TXT are removed. Requires a confirmation step that summarizes the diff (N added, N removed, N unchanged) before committing. Undoable in one step regardless of size, same as autolayout.

**Known limitation (inherent to a labels-only, ID-less format):** because matching is by label text, renaming a node in the text editor is indistinguishable from deleting the old node and creating a new one — the renamed node will lose its saved position and be re-placed as if new. This is a structural property of the format, not a bug; worth remembering when hand-editing.

### 5.4 Versioned filename convention

```
<graph-name>_v<0000>_<UTC-timestamp>.json
<graph-name>_v<0000>_<UTC-timestamp>.txt
<graph-name>_v<0000>_<UTC-timestamp>.domain.yaml
```

Example: `frankfurt-ai-ontology_v0042_2026-07-25T1420Z.json` and its matching `.txt` and `.domain.yaml`. All three files are always written together on every explicit save. *(Originally two files; the `.domain.yaml` was added by `agent_ontology_spec.md` §5.)*

**Graph-name sanitization.** `<graph-name>` is the user's graph title reduced to a filesystem-safe form: any Unicode letter or digit is kept, whitespace runs collapse to `-`, and control characters, the Windows-reserved punctuation `< > : " / \ | ? *`, leading/trailing dots and dashes, and the reserved device names (`CON`, `NUL`, `COM1`…) are removed or escaped. The result is capped at 80 code points (never splitting a surrogate pair) and falls back to `graph` if nothing usable remains.

*(Amended after implementation: the original rule kept only `[A-Za-z0-9_-]`, which is ASCII-safe rather than filesystem-safe — "Ügyfélkérdés ontológia" was written to disk as "gyflkrds-ontolgia", and a name in a non-Latin script emptied out entirely into the `graph` fallback, so every save from such a user collided on one filename. See TODO.md's dated Log entry.)*

### 5.5 JSON import (full-fidelity restore)

The canonical format of §5.1 is also readable, through the same entry point as §5.3. This is the only import path that can restore a graph *as it was* — the TXT format carries no coordinates and the domain-model YAML carries neither coordinates nor ids, so both of those reopen a graph as a fresh layout with fresh ids.

What it restores that the other two cannot: stable node/edge/rule/action ids, box geometry, and `meta` — so a restored graph keeps its `graph_id` and version counter, and the next "Save Version" continues the same numbered series (v0007 → v0008) rather than restarting at v0001 as if it were a new graph.

Two modes, mirroring §5.3, both a single undoable action:

- **Replace (full restore).** The file *is* the graph: ids, positions, box sizes, `meta` and (via `meta.graph_name`, or failing that the §5.4 filename) the graph's name are all adopted verbatim. Anything currently on the canvas is discarded. **On an empty canvas this is what the single offered action does**, whichever button is pressed — merging into an empty graph would discard exactly the ids, coordinates and version chain this format exists to preserve, and nothing can be lost when there is nothing there.
- **Merge.** Label-matched against the current graph, the same way §5.3 and `agent_ontology_spec.md` §11 match: a matched node keeps its existing id and its on-canvas position, and takes the file's content (meaning, aliases, properties). A new node is placed at its own saved coordinates when that space is free, and falls back to shelf placement when it isn't. Incoming ids are not adopted in this mode.

Unlike §5.3 and the YAML importer, **no autolayout pass runs after a JSON import** — those two reflow because their formats carry no coordinates at all, whereas here the coordinates are the point.

**Tolerance.** The format is documented as hand-editable and is a plausible output for an external pipeline, so a structurally unusable *item* is dropped with a warning shown in the import dialog rather than failing the whole file: a node with no label, an edge pointing at a node the file doesn't contain, an action referencing an unknown class or rule. A duplicated id keeps its content but is reassigned a fresh id, so it cannot shadow the first holder. Missing geometry falls back to the default box size. Only a file that is not a JSON object at all is a hard failure, reported as a syntax error.

**Id-counter safety.** Restoring ids requires lifting the app's own id counters clear of every id the file uses, before any further node is created. Skipping that is the one mistake in a preserve-the-ids importer that corrupts a graph silently rather than loudly: restoring `n1..n40` while the counter still sits at 1 means the next node the user adds is a second `n5`, after which every id-keyed lookup resolves to whichever of the two is found first.

### 5.6 Import routing

Which importer runs is decided per file:

1. **Content first, for JSON only.** If the file parses as a JSON *object*, it goes to §5.5 regardless of its name. Neither an edge list nor a domain-model YAML can parse as one, so this can never misroute a file belonging to another importer. This exists because the file picker's own "All files" escape hatch (and drag-drop) let a canonical `.json` reach the TXT parser, which found no `## NODES` header and imported nothing at all, silently.
2. **Extension next**, and it stays authoritative for every case that predates this rule: `.json` → §5.5, `.yaml`/`.yml` → domain model, `.txt` → §5.3. A `.json` whose content doesn't parse is reported as a JSON syntax error rather than degrading to the TXT parser — the user named it JSON, so that is the useful thing to say.
3. **Content sniffing last**, for a file with no extension or one this app doesn't claim: a top-level `classes:`/`relationships:`/`rules:`/`actions:` key routes to the domain model, a `## NODES`/`## EDGES` header or an edge line routes to §5.3.
4. **Otherwise unrecognized.** The dialog explains that the file isn't in an importable format and offers no import action — previously such a file still offered Merge and Replace, with Replace standing ready to delete the graph "to match" a file the app had never parsed. The same no-action state covers a file that parses correctly but contains nothing to import.

---

## 6. Canvas & Rendering

- **Renderer:** Canvas2D (not DOM/SVG), driven by a single camera transform (pan offset + zoom scale) applied per frame.
- **Zoom:** continuous, effectively unbounded in both directions (practical clamp at extreme values to avoid float precision issues, e.g. 0.01×–100×).
- **Performance target:** smooth interaction (60fps drag/pan/zoom) up to ~1,000 nodes, with typical real-world usage in the low hundreds. Viewport culling (only draw/hit-test what intersects the visible camera rect) is sufficient at this scale without a spatial index; a quadtree can be added later without any format or interaction changes if real usage exceeds this comfortably.
- **Disconnected layouts:** the camera and culling logic make no assumption of a single connected component — scattered snippets render and pan/zoom identically to a single connected graph.
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
| Delete node/edge | select + delete key, or long-press → delete | trash icon on selection |
| Undo/redo | — (no dedicated gesture; avoids conflicting with pan/zoom) | Undo/Redo buttons — primary and only path, by design |
| Autolayout | — (deliberately no gesture) | explicit "Auto-layout" button, one undo step |
| Save Version | — | explicit "Save Version" button |
| Import | drag-and-drop a file onto the canvas (where supported) | explicit "Import" button |

---

## 8. Editing Model

- **Default:** zero automatic layout. Every node stays exactly where dragged until moved again.
- **Autolayout:** explicit, opt-in, recorded as a single undo step (one "before" snapshot of all positions, restorable in one undo regardless of how many nodes moved). Algorithm choice (force-directed vs. hierarchical vs. grid) is an implementation detail, not fixed by this spec.
- **Undo/redo:** command-pattern stack in memory, independent of the Tier-1 live-save engine. Every discrete user action (add, move, connect, delete, autolayout, TXT import) is one undo step. Not persisted across a full app reload — reload starts a fresh undo stack from the last saved state.

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
| 2 | Group membership mechanic | ~~Explicit drag-small-into-big; commits on drop; never recomputed from later geometry changes.~~ **REVERSED — see #11.** |
| 3 | Group boundary | ~~Always `manual`; groups never auto-fit to members.~~ **REVERSED — see #11.** |
| 4 | Bidirectional edge rendering | Plain line, no arrowheads at either end. |
| 5 | Scale target | Design headroom to ~1,000 nodes; typical real usage in the low hundreds. |
| 6 | Multi-graph / connectivity | Single graph per session; graph is not required to be fully connected — disconnected snippets are normal. |
| 7 | Version retention | Unbounded; no automatic pruning. |
| 8 | Undo control | Buttons only, no dedicated gesture. |
| 9 | TXT re-import | Required. Merge (safe, additive) and Replace (destructive, confirmed) modes, label-matched. |
| 10 | Concurrent multi-device editing | Out of scope. |
| 11 | Groups removed entirely | User-requested pivot toward a strict classes/relationships ontology model (the `agent_ontology_spec.md` initiative) — groups added complexity (visual nesting, drag-to-join semantics, an independently resizable box, an auto-generated `contains` edge, ambiguous "is this really a category or just visual tidying?" semantics) with no clean mapping onto that model. Removed from the UI, the data model (`type`, `groups[]`, `boundary_mode` all gone; box size is now always fixed), and both file formats — not just excluded from the newer YAML export. Reverses Decisions #2 and #3 above; superseded by nothing — there is no replacement grouping mechanism in v1.1. |

---

## Appendix: Reference Python loader for the TXT format

Demonstrates the format is genuinely trivial to consume externally — no dependencies beyond the standard library. (The app's own TXT import, Section 5.3, additionally performs label-matched merge/replace against existing graph state; this snippet is a minimal read-only reference for external scripts.)

```python
def load_edge_list(path):
    nodes, edges = [], []
    section = None
    with open(path, encoding="utf-8-sig") as f:  # utf-8-sig strips a leading BOM (e.g. from Windows Notepad/Excel); decodes identically to utf-8 otherwise
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
                if line:
                    nodes.append({"label": line})
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
