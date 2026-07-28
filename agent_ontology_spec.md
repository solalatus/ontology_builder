# Agent Ontology — Domain Model Authoring (Technical Specification)

**Status:** v0.1 — Draft plan, phased implementation not yet started
**Builds on:** `spec.md` (Knowledge Graph Canvas v1.0, shipped, unchanged). This document specifies an
**additive** layer on top of the existing app. Canvas mechanics, camera, storage tiers, undo/redo,
theming, i18n, and the existing JSON/TXT export formats all stay exactly as `spec.md` defines them.
Nothing in this document removes or breaks the app as it exists today.
**Source requirement:** `176ada33-minimal_domain_model_howto.md` (user-supplied, "How to Describe a
Domain for an AI Agent") — the concrete artifact this app's next iteration must be able to *produce*
by hand-authoring a graph on canvas, the same way it already produces JSON/TXT exports today.

---

## 1. Purpose & Scope

The howto document describes a small, structured way to hand an AI agent a description of a business
domain: **classes** (kinds of things, with a meaning, aliases, and decision-relevant properties),
**relationships** between classes (named with a verb phrase, with a meaning), **rules** (named,
plain-language conditions), and **actions** (named operations with preconditions, effect, and a
verification step). The complete worked example in that document is reproduced faithfully in Section 5
below as the export target.

This app already lets a user sketch a graph of labeled boxes and labeled connections by hand, visually,
with instant undo and file export — exactly the authoring motion the howto assumes ("write down the
main things," "add short meanings," "describe connections as arrows"). What's missing is: (a) fields
to actually capture *meaning*, *aliases*, and *properties* per node, and *meaning* per relationship —
today's node only has a bare `label`; (b) a place to define **rules** and **actions**, which aren't
graph-shaped at all (they're named lists of plain-language conditions/steps, not boxes-and-arrows); and
(c) an export that emits the howto's exact structure, not just the existing generic JSON/TXT.

**Explicit non-goal, matching `spec.md` Section 10's existing stance:** this is a *description*
authoring tool, not a rules/inference engine. Rules and Actions are captured and exported as structured
*text* for an agent (or a human) to read and reason about — nothing in this app evaluates a rule's
conditions or executes an action's effect. Same posture as the base app's "no OWL/RDF reasoning."

---

## 2. Foundational modeling decision: nodes are Classes, not instances

`spec.md`'s own worked example (Andhra Pradesh, Telugu, Guatemala, European Union) is an **instance**-level
knowledge graph — specific real things, not kinds of things. The howto's worked example (Invoice,
Supplier, Employee) is unambiguously **class**-level — kinds of things a business talks about. The app's
existing data model doesn't distinguish the two; a "node" is just a labeled box either way.

**Decision:** Agent Ontology mode treats every non-group node as a **Class** — a kind of thing, not a
specific instance. This isn't a new mode switch or a new node type: it's a reframing of the same
`type: "entity"` node, with new optional fields (meaning, aliases, properties) that are only meaningful
once you're modeling at the class level. A user who wants to keep using the app exactly as `spec.md`
describes — sketching instance-level graphs — loses nothing and can simply leave the new fields empty;
the base app's behavior (Sections 3–9 of `spec.md`) is completely unaffected.

---

## 3. Terminology mapping & renames

| Howto term | Current app term | New UI label | Internal identifier |
|---|---|---|---|
| Class | Node (`type: "entity"`) | **Class** | unchanged: `type: "entity"` |
| *(no howto equivalent — see Section 6)* | Group (`type: "group"`) | Group (unchanged) | unchanged: `type: "group"` |
| Relationship | Edge | Relationship (concept); "Connect" stays as the mode-toggle button label | unchanged: `relation` field |
| class meaning | — (dormant `notes` field, schema'd but never exposed in any editor, see Section 4.1) | **Meaning** | `notes` → renamed to `meaning` |
| class aliases | — | **Aliases** | new: `aliases: string[]` |
| class properties | — | **Properties** | new: `properties: Property[]` |
| relationship meaning | — | **Meaning** | new: `meaning: string` on Edge |
| Rule | — | **Rules** (new panel, off the toolbar) | new top-level `rules: Rule[]` |
| Action | — | **Actions** (new panel, off the toolbar) | new top-level `actions: Action[]` |

**Toolbar label changes:** "Add Node" → "Add Class" (and the matching Hungarian string). "Node label"
placeholder → "Class name." Everything else in the toolbar (Add Group, Connect, Auto-layout, Undo,
Redo, Save Version, Folder Sync, Import from TXT, Clear, zoom, theme/lang toggles) is unchanged.

**Deliberately not renamed:** the app's own title ("Knowledge Graph Canvas" / "Tudásgráf Vászon"). The
base app remains a general graph-sketching tool; Agent Ontology is a capability it gained, not a
different product. Flagged as Open Question 1 (Section 9) in case you'd rather it read as a rename too.

**A genuine find, not a new field:** `notes` already exists in the Node schema (`spec.md` Section 4.1)
and already round-trips through the JSON export — it was speced but never wired to any editor UI. It
becomes `meaning`. Zero migration risk: since no UI has ever set it, no real saved graph has a non-null
value to preserve.

---

## 4. Data model additions

### 4.1 Node (Class) — additions to `spec.md` §4.1

| Field | Type | Notes |
|---|---|---|
| `meaning` | string \| null | one plain sentence, replaces the dormant `notes` field (renamed, not added) |
| `aliases` | string[] | alternate names for the same class; empty array by default |
| `properties` | `Property[]` | ordered list, empty array by default (see below) |

```
Property = {
  id: string,                                   // stable, for rename-safe references — unused today, reserved for Section 6 stretch (Import)
  name: string,                                  // e.g. "amount"
  type: "text" | "number" | "date" | "boolean",  // "boolean" is an addition beyond the howto's examples — Open Question 2
  unit: string | null,                           // only meaningful for type: "number"; e.g. "EUR"
  allowed: string[] | null,                      // fixed choice list, e.g. ["draft","matched","approved"]
}
```

### 4.2 Edge (Relationship) — addition to `spec.md` §4.2

| Field | Type | Notes |
|---|---|---|
| `meaning` | string \| null | one plain sentence describing the relationship; `relation` (the existing field) continues to serve as the verb-phrase name |

### 4.3 New top-level collections

```
Rule = {
  id: string,
  name: string,            // e.g. "canApproveInvoice"
  conditions: string[],    // ordered, plain-language, free text
}

Action = {
  id: string,
  name: string,             // e.g. "approveInvoice"
  inputClassId: string,     // node id of the Class this action acts on
  preconditions: string[],  // Rule ids (resolved to Rule names at display/export time — safe under rename)
  effect: string,           // free text, e.g. "invoice status becomes approved"
  verification: string,     // free text, e.g. "read the invoice again and confirm the status"
}
```

`state.rules` and `state.actions` — two new top-level arrays alongside `state.nodes`/`state.edges`,
persisted through Tier 1 exactly like nodes/edges already are, and included in every future JSON/domain
export. Referencing by id (not name) for `inputClassId` and `preconditions` follows the same pattern
edges already use for `source`/`target` — renaming a class or a rule doesn't silently orphan a
reference.

### 4.4 Backward compatibility

Every new field is optional and defaults to an empty/null value on load. A graph saved before this
feature existed loads exactly as it does today; `rules`/`actions` default to `[]` if absent from a
loaded payload. No version bump or migration step needed in Tier 1's payload — this is strictly
additive to the existing shape `spec.md` §5.1 already documents.

---

## 5. Export: Domain Model YAML

Bundled into the **existing** "Save Version" action as a third file, alongside the `.json` and `.txt`
`spec.md` §5.4 already writes together — no new toolbar button for export. Filename:
`<graph-name>_v<0000>_<UTC-timestamp>.domain.yaml`.

Structure mirrors the howto's own compact example exactly:

```yaml
classes:
  Invoice:
    meaning: A request from a supplier to receive payment.
    aliases: [bill]
    properties:
      invoiceNumber: {type: text}
      amount: {type: number, unit: EUR}
      status:
        allowed: [draft, matched, disputed, approved, paid]
      dueDate: {type: date}

relationships:
  issuedBy:
    from: Invoice
    to: Supplier
    meaning: The supplier that submitted the invoice.

rules:
  canApproveInvoice:
    conditions:
      - invoice status is matched
      - supplier risk status is clear

actions:
  approveInvoice:
    input: Invoice
    preconditions: [canApproveInvoice]
    effect: invoice status becomes approved
    verification: confirm the new invoice status
```

**Generation rules:**
- One `classes` entry per non-group node, keyed by its `label` (Class name) exactly as typed — no
  derived slug. Properties, keyed by property `name`, only include `unit`/`allowed` when set.
- One `relationships` entry per non-`auto` edge, keyed by a camelCase id derived from the edge's
  `relation` label (e.g. "issued by" → `issuedBy`) — the label itself stays human-readable in the UI;
  the export derives the machine key. Collisions (two edges, same derived key, different class pairs)
  get a numeric suffix (`issuedBy2`) rather than silently overwriting one another — flagged as Open
  Question 3, since it's the one place this app's free-form graph model doesn't map 1:1 onto the
  howto's implied "one definition per named relationship type."
- `rules`/`actions` map close to directly onto Section 4.3's shapes, keyed by `name`.
- **Group nodes and their auto-generated `contains` edges are handled specially — see Section 6.**
- A hand-written minimal YAML serializer is used (indentation + list/scalar rules only, no anchors/
  tags/flow-style needed for this shape) — consistent with the project's zero-external-dependency
  constraint (`spec.md` §2). No new library, no build step.
- Nothing here changes the existing `.json`/`.txt` outputs — they keep exporting the full canvas
  exactly as `spec.md` §5.1/5.2 specify, group nodes and camera-irrelevant fields included.

**Deliberately deferred (not in the first phased pass):** import — parsing a hand-edited or
agent-generated domain YAML back into canvas state, symmetric to the existing TXT import (`spec.md`
§5.3). The howto is framed as a guide for *producing* a description; export is the load-bearing
capability. Import is real and desirable (round-tripping an agent's edits back onto the canvas) but is
listed as a later phase (Phase G, Section 8) so the first pass stays focused.

---

## 6. Groups → class hierarchy (proposed, flagged as Open Question 4)

The howto has no notion of grouping/hierarchy in its minimal example. This app already has one:
dragging a class into a group commits an automatic `contains` edge (`spec.md` §4.3). Rather than treat
Groups as purely cosmetic canvas organization (safe, but wastes a feature that already does exactly
what a "supertype/category" relationship needs), the proposal is: **a group's `contains` edges export
as relationship entries too**, using a fixed relationship name (default proposal: `includes`) — turning
existing drag-to-group interactions into free, no-new-UI class-hierarchy authoring.

This is a genuine design choice beyond what the howto shows, not something it requires — happy to keep
groups purely cosmetic (excluded from the domain export entirely) instead, if you'd rather the export
stay a literal minimum. Either way, nothing about how Groups work on canvas changes; this is purely an
export-time interpretation decision.

---

## 7. UI / affordance plan

- **Class editor.** A new 4th icon in the existing `#sel-toolbar` (alongside rename ✎ / toggle-direction
  ⇄ / trash 🗑) when a Class or Group node is selected: "Edit Details," opening a new modal (reusing the
  existing `.modal-dialog`/`.modal-overlay` pattern from the confirm/import dialogs) with: Meaning
  (textarea), Aliases (repeatable text input), Properties (repeatable row: name, type dropdown, unit —
  shown only for type "number", allowed-values list — shown only when relevant). The existing rename (✎)
  stays a fast, single-field, label-only edit — unchanged — so the common case doesn't get slower.
- **Relationship editor.** Same new icon, shown when an edge is selected instead: a smaller modal with
  just Meaning (the `relation` label keeps using the existing rename flow as today).
- **Rules manager.** One new toolbar button, "Domain Model," opening a modal with two sections/tabs:
  Rules (name + an editable list of condition strings, add/edit/delete) and Actions (name + input-class
  dropdown populated from current nodes + preconditions multi-select populated from current rules +
  effect/verification text fields, add/edit/delete). This is the **only** new toolbar button — chosen
  over two separate buttons to avoid further crowding an already dense toolbar (14 interactive elements
  today).
- **Localization.** Every new label/placeholder/button gets `en`/`hu` entries in the existing `STRINGS`
  table, following the exact pattern already used for every other UI string.
- **No canvas rendering changes required for correctness** — a class with meaning/properties filled in
  still renders as the same box it does today. A small non-blocking visual affordance (e.g. a subtle
  dot/badge on classes that have properties defined) is a reasonable later-phase nicety, not required
  for the feature to work, and deferred to avoid scope creep in the first pass.

---

## 8. Non-goals for this iteration

- No rule/action **execution** — conditions and effects are captured and exported as text, never
  evaluated or run (Section 1).
- No OWL/RDF reasoning or consistency validation — same stance as `spec.md` §10.
- No live/real-time agent hookup to a running canvas — this was explicitly discussed and ruled out
  earlier in this project's history as requiring a fundamentally different (server-backed) architecture;
  Agent Ontology is strictly an **authoring-then-export** capability, same shape as the existing TXT
  export already is.
- No automatic property-type inference from existing labels/data.
- No changes to storage tiers, undo/redo, theming, or canvas rendering mechanics beyond what's listed
  in Section 7.

---

## 9. Open questions (raise before/while implementing — flagged inline above too)

1. Should the app's own title ("Knowledge Graph Canvas") change to reflect the ontology-authoring
   capability, or stay as-is with Agent Ontology as an added capability rather than a rebrand?
   (Section 3 default: stay as-is.)
2. Is a `"boolean"` property type worth adding beyond the howto's own examples (text/number/date), or
   should the first pass match the howto literally and add boolean later if actually needed?
   (Section 4.1 default: include it — it's a common, obvious type.)
3. How should same-named relationships between different class pairs be disambiguated in the YAML
   export — numeric suffix (default proposed), or some other scheme? (Section 5.)
4. Should group `contains` edges export as a `relationships` entry (proposed default: relationship name
   `includes`), or should Groups stay purely cosmetic/canvas-only and be excluded from the domain
   export entirely? (Section 6.)

---

## 10. Decision Log

| # | Topic | Decision |
|---|---|---|
| 1 | Node vs. instance framing | Non-group nodes are treated as Classes (kinds of things), not instances — additive to the existing generic node model, doesn't force a mode switch. |
| 2 | `notes` field | Renamed to `meaning` rather than adding a parallel field — it was schema'd but never exposed in any editor, so this is a zero-risk rename, not new state. |
| 3 | Rules/Actions references | Stored by id (rule id, class id), resolved to names at display/export time — consistent with how edges already reference node ids, not labels. |
| 4 | Export delivery | Bundled as a third file into the existing "Save Version" action, not a new toolbar button — minimizes new UI surface. |
| 5 | Rules/Actions UI | One combined "Domain Model" toolbar button/modal rather than two separate toolbar buttons — toolbar-crowding concern. |
| 6 | Class/Relationship detail editing | A new icon in the existing selection toolbar opening a modal, leaving the existing fast single-field rename flow untouched. |
| 7 | Import (YAML → canvas) | Deferred to a later phase — export is the load-bearing capability the howto actually calls for; import is desirable but secondary. |
