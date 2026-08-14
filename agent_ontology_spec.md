# Agent Ontology — Domain Model Authoring (Technical Specification)

**Status:** v1.0 — Implemented in full (Phases A through I complete; see `agent_ontology_todo.md`'s
Current State and Decision Log for the final account, including the two still-open, non-blocking
questions #1/#2 in Section 9).
**Builds on:** `spec.md` (Knowledge Graph Canvas v1.1 — amended, Groups removed; see its Decision Log
#11 and Section 2/6 below). Canvas mechanics, camera, storage tiers, undo/redo, theming, i18n, and the
existing JSON/TXT export formats all stay as `spec.md` defines them, with two exceptions this initiative
itself introduced and that `spec.md` now reflects directly: the base Node's dormant `notes` field was
renamed to `meaning` (Section 3, Decision Log #2; `spec.md` §4.1/§5.1), and Groups were removed
entirely (Section 6; `spec.md` Decision Log #11). Nothing else in this document removes or breaks the
app as it exists today.
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

**Decision:** Agent Ontology mode treats every node as a **Class** — a kind of thing, not a
specific instance. This isn't a new mode switch or a new node type: it's a reframing of the same
node, with new optional fields (meaning, aliases, properties) that are only meaningful
once you're modeling at the class level. A user who wants to keep using the app exactly as `spec.md`
describes — sketching instance-level graphs — loses nothing and can simply leave the new fields empty;
the base app's behavior (Sections 3–9 of `spec.md`) is completely unaffected.

**Update (see `spec.md` Decision Log #11):** the base app's Groups feature was removed entirely after
this document was first drafted, resolving Open Question 4 (Section 9) by elimination rather than by
choosing an export-time interpretation — there is no longer a "non-group node" distinction to make; all
nodes are Classes. Section 6 below is kept for historical record but no longer describes a live design
choice.

---

## 3. Terminology mapping & renames

| Howto term | Current app term | New UI label | Internal identifier |
|---|---|---|---|
| Class | Node | **Class** | unchanged |
| Relationship | Edge | Relationship (concept); "Connect" stays as the mode-toggle button label | unchanged: `relation` field |
| class meaning | — (dormant `notes` field, schema'd but never exposed in any editor, see Section 4.1) | **Meaning** | `notes` → renamed to `meaning` |
| class aliases | — | **Aliases** | new: `aliases: string[]` |
| class properties | — | **Properties** | new: `properties: Property[]` |
| relationship meaning | — | **Meaning** | new: `meaning: string` on Edge |
| Rule | — | **Rules** (new panel, off the toolbar) | new top-level `rules: Rule[]` |
| Action | — | **Actions** (new panel, off the toolbar) | new top-level `actions: Action[]` |

**Toolbar label changes:** "Add Node" → "Add Class" (and the matching Hungarian string). "Node label"
placeholder → "Class name." Everything else in the toolbar (Connect, Auto-layout, Undo,
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
  id: string,                                   // stable, for rename-safe references — unused today, reserved for Section 11 stretch (Import)
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
| `aliases` | string[] | alternate phrasings for the same relationship; empty array by default. Added after `meaning` shipped — see `helper_agent_todo.md`'s dated addendum for why (a real ontology-recovery eval run found the interviewer eliciting real relationship synonyms from a domain expert with nowhere to store them, since edges had no alias concept at all, unlike nodes) |

### 4.3 New top-level collections

```
CompetencyQuestion = {
  id: string,              // e.g. "cq1" — stable, never reused
  text: string,            // the real question, e.g. "Which escalation policy applies to this support request?"
}

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

`state.competencyQuestions` (issue #94) is the third such array. A **Competency Question (CQ)** is a
requirement *on* the Agent Ontology, not an element of it: the real question the future domain agent
must be able to answer, or have enough domain orientation to work out how to answer. It is deliberately
**not** runtime instance data and **not** a query — a satisfactory ontology does not contain the answer
to "which escalation policy applies to this support request?", it contains enough orientation for the
future agent to know which concepts, relationships, rules, actions, sources and verification steps are
involved in obtaining it. CQs are therefore stored alongside classes/relationships/rules/actions but
never become canvas nodes, and carry no bindings to individual model elements.

They may be **elicited conversationally** (the Helper Agent's Phase 1 — see `helper_agent_plan.md`) or
**imported** from an external process that produced them (a `.domain.yaml` containing only a
`competency_questions:` section is a valid import — the external-requirements-seed workflow). Both
Domain Model YAML and canonical JSON preserve them; the `.txt` edge list deliberately does not, since it
remains the lossy nodes/edges representation.

The minimal item shape is `{id, text}` and nothing else — no `status`, `source`, `priority`, `tags`,
`votes`, `versions`, `provenance`, `formalQuery` or `bindings`. The stable id exists from the start so a
question can be *reworded* without becoming a different requirement, which is what makes merge/import
semantics, Review Changes and coverage results able to refer to the right question.

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

`competencyQuestions`/`nextCqNum` (issue #94) are additive in exactly the same way, and deliberately do
**not** bump `format_version` either. The compatibility contract in all four directions:

* **New app, old file** (JSON, Domain Model YAML, or stored payload with no competency questions):
  loads as `[]`, `nextCqNum: 1`. No migration dialog, no error.
* **New app, new file**: CQs load normally, ids preserved exactly through canonical JSON.
* **Old app, new file**: the existing parsers tolerate unknown top-level fields, so an older build keeps
  loading the parts it understands and ignores the questions. An old-build round trip is therefore
  **forward-tolerant but lossy** — opening a new file in an old build and saving it again can discard
  the competency questions. That is accepted for an additive v1 extension and documented here rather
  than defended against.
* A future *incompatible reinterpretation* of an existing field would justify `format_version: 2`; this
  addition does not.

---

## 5. Export: Domain Model YAML

Bundled into the **existing** "Save Version" action as a third file, alongside the `.json` and `.txt`
`spec.md` §5.4 already writes together — no new toolbar button for export. Filename:
`<graph-name>_v<0000>_<UTC-timestamp>.domain.yaml`.

Structure mirrors the howto's own compact example, with one deliberate deviation from it (see the
`relationships` bullet below, resolving Open Question 3):

```yaml
competency_questions:
  - id: cq1
    text: Which escalation policy applies to this support request?

classes:
  Invoice:
    meaning: A request from a supplier to receive payment.
    aliases:
      - bill
    properties:
      invoiceNumber:
        type: text
      amount:
        type: number
        unit: EUR
      status:
        type: text
        allowed:
          - draft
          - matched
          - disputed
          - approved
          - paid
      dueDate:
        type: date

relationships:
  - name: issuedBy
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
    preconditions:
      - canApproveInvoice
    effect: invoice status becomes approved
    verification: confirm the new invoice status
```

**Generation rules:**
- One `classes` entry per node, keyed by its `label` (Class name) exactly as typed — no
  derived slug. `meaning` is always present (`null` when unset). Each property is keyed by its `name`,
  with `type` always present and `unit`/`allowed` included only when actually set (`unit` is only ever
  meaningful for `type: number`; `allowed` is an independent, optional fixed-choice list on any type).
- **`relationships` is a list, not a name-keyed map** (resolves Open Question 3): one entry per edge,
  each `{name, from, to, meaning}`, where `name` is a camelCase id derived from the edge's `relation`
  label (e.g. "issued by" → `issuedBy`, the same derivation the howto's own naming style uses) and
  `from`/`to` are the endpoint classes' labels. A list sidesteps the collision problem a name-keyed map
  would have (two edges deriving the same camelCase key between different class pairs) entirely, rather
  than needing a numeric-suffix disambiguation scheme — chosen over the howto's own map-shaped example
  specifically because this app's free-form graph model allows exactly that collision and a list has no
  uniqueness constraint to violate. `meaning` is included even when `null`, for a uniform shape across
  entries (unlike `classes`' properties, where `unit`/`allowed` are omitted rather than null — those are
  per-property optional attributes, not a top-level field every entry has).
- `competency_questions` is a **list** of `{id, text}` and comes **first**, because it states the
  requirements the rest of the document exists to satisfy. It is the one section that carries a real
  internal id rather than being keyed by name: a question has no name to key on, and its identity has to
  survive a rewording of its own text.
- `rules`/`actions` map close to directly onto Section 4.3's shapes, keyed by `name`.
- A hand-written minimal YAML serializer is used, **block style only** — every list renders as `- item`
  lines, never an inline `[a, b, c]` flow sequence, and every nested object renders as indented `key:`
  lines, never an inline `{...}` flow mapping (indentation + list/scalar rules only, no anchors/tags/
  flow-style at all) — consistent with the project's zero-external-dependency constraint (`spec.md`
  §2): a single style to implement and to test against, deterministically, without a flow-vs-block
  decision to get right for every value shape. A scalar needing to be unambiguous under YAML's plain-
  scalar grammar (contains `:`, `#`, a bracket/brace/comma, starts with whitespace or a YAML indicator
  character, or looks like a reserved literal such as `true`/`null`/a bare number) is double-quoted with
  standard backslash escaping; everything else renders unquoted for readability, matching the howto's
  own style.
- Nothing here changes the existing `.json`/`.txt` outputs — they keep exporting the full canvas
  exactly as `spec.md` §5.1/5.2 specify, camera-irrelevant fields included.

**Deliberately deferred (not in the first phased pass):** import — parsing a hand-edited or
agent-generated domain YAML back into canvas state, symmetric to the existing TXT import (`spec.md`
§5.3). The howto is framed as a guide for *producing* a description; export is the load-bearing
capability. Import is real and desirable (round-tripping an agent's edits back onto the canvas) but was
listed as a later phase (Phase G) so the first pass stayed focused — since implemented; see Section 11.

---

## 6. Groups → class hierarchy (superseded — Groups removed, see `spec.md` Decision Log #11)

**Historical record only — this section no longer describes a live design choice.** It originally
proposed that a group's `contains` edges export as relationship entries too, using a fixed relationship
name (`includes`), turning drag-to-group interactions into free class-hierarchy authoring — framed as
Open Question 4 in Section 9.

That question was resolved by a different route than either option it posed: the user asked for Groups
to be removed from the base app entirely — canvas UI, data model, and both file formats — rather than
export-time-only exclusion, on the grounds that Groups added complexity with no clean mapping onto a
strict classes/relationships model. See `spec.md`'s Decision Log #11 for the full rationale. There is no
group→hierarchy export logic to write; every node is simply a Class.

---

## 7. UI / affordance plan

- **Class editor.** A new 4th icon in the existing `#sel-toolbar` (alongside rename ✎ / toggle-direction
  ⇄ / trash 🗑) when a Class node is selected: "Edit Details," opening a new modal (reusing the
  existing `.modal-dialog`/`.modal-overlay` pattern from the confirm/import dialogs) with: Meaning
  (textarea), Aliases (repeatable text input), Properties (repeatable row: name, type dropdown, unit —
  shown only for type "number", allowed-values list — shown only when relevant). The existing rename (✎)
  stays a fast, single-field, label-only edit — unchanged — so the common case doesn't get slower.
- **Relationship editor.** Same new icon, shown when an edge is selected instead: a smaller modal with
  Meaning and Aliases (the `relation` label keeps using the existing rename flow as today; no Properties
  section — edges have no property concept). Originally shipped Meaning-only; aliases were added after a
  real ontology-recovery eval run found the interviewer routinely eliciting real relationship synonyms
  from a domain expert with nowhere to store them — see `helper_agent_todo.md`'s dated addendum.
- **Competency questions.** No new toolbar button and no dedicated application: one more section inside
  the existing "Domain Model" modal, placed **before** Rules. Each question is a single multiline text
  field plus a remove button, with an Add button and a plain text filter, following the same draft-then-
  Save behaviour Rules/Actions already use, so editing several questions is one undo step. Ids are not
  editable — they ride along in a data attribute. Deliberately absent: any CQ dashboard, voting,
  tagging, priority, or provenance UI.
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
3. ~~How should same-named relationships between different class pairs be disambiguated in the YAML
   export — numeric suffix, or some other scheme?~~ **Resolved — see Section 5 and Decision Log #9:
   `relationships` is a list, not a name-keyed map, so there is no key to collide.**
4. ~~Should group `contains` edges export as a `relationships` entry, or should Groups stay purely
   cosmetic/canvas-only and be excluded from the domain export entirely?~~ **Resolved — see Section 6
   and `spec.md` Decision Log #11: Groups were removed from the app entirely, not just from this
   export.**

---

## 10. Decision Log

| # | Topic | Decision |
|---|---|---|
| 1 | Node vs. instance framing | Nodes are treated as Classes (kinds of things), not instances — additive to the existing generic node model, doesn't force a mode switch. |
| 2 | `notes` field | Renamed to `meaning` rather than adding a parallel field — it was schema'd but never exposed in any editor, so this is a zero-risk rename, not new state. |
| 3 | Rules/Actions references | Stored by id (rule id, class id), resolved to names at display/export time — consistent with how edges already reference node ids, not labels. |
| 4 | Export delivery | Bundled as a third file into the existing "Save Version" action, not a new toolbar button — minimizes new UI surface. |
| 5 | Rules/Actions UI | One combined "Domain Model" toolbar button/modal rather than two separate toolbar buttons — toolbar-crowding concern. |
| 6 | Class/Relationship detail editing | A new icon in the existing selection toolbar opening a modal, leaving the existing fast single-field rename flow untouched. |
| 7 | Import (YAML → canvas) | Deferred to a later phase — export is the load-bearing capability the howto actually calls for; import is desirable but secondary. |
| 8 | Groups (Open Question 4) | Resolved by removing Groups from the base app entirely (canvas UI, data model, both file formats) rather than choosing an export-time interpretation — see `spec.md` Decision Log #11 and Section 6 above. |
| 9 | Relationship-key collisions (Open Question 3) | Resolved by making `relationships` a list of `{name, from, to, meaning}` objects rather than a name-keyed map — sidesteps the collision problem rather than disambiguating it, since a list has no uniqueness constraint. See Section 5. |
| 10 | Import merge/replace semantics (Phase G) | Deliberately more aggressive than the base app's TXT node/edge import: a matched class/relationship/rule/action is overwritten with the file's values on both Merge and Replace, not left untouched — only Replace additionally removes anything the file doesn't mention. Same two-mode dialog/UX is reused, not a new confirmation flow. See Section 11. |

---

## 11. Domain Model YAML Import (Phase G) — resolved design

Symmetric to Phase F's export (Section 5): a hand-written parser for exactly the block-style YAML
subset `buildDomainYamlExport()` can produce (2-space indent, `- item` lists, `key:`/`key: value` maps,
double-quoted/escaped scalars, inline `[]`/`{}` for empty collections) — not a general YAML parser, the
same "symmetric to the app's own grammar, not the whole spec" posture `parseTxtImport()` takes for the
TXT format (`spec.md` §5.3). Malformed or truncated input degrades gracefully (missing pieces default to
empty) rather than throwing.

*(Amended after implementation.* The exporter's grammar is still the parser's contract, but "only what
the exporter emits" turned out to be too narrow for the two populations that actually write these files
— a live agent, and a human hand-editing an export. The accepted subset now additionally covers:
non-empty inline flow lists `[a, b]` **and** flow maps `{type: number, unit: EUR}`, including nested
ones; single-quoted scalars; `~` as null; `|` and `>` block scalars with any chomping indicator;
trailing `# comments` outside quotes; tab indentation; and any consistent indent width rather than
exactly two spaces. Each of those previously failed *silently* — an unrecognized value token fell
through to the plain-string branch, so a downstream `Array.isArray`/`typeof === "object"` check saw a
string and created the field empty, with no error anywhere. Two of them were real reported bugs: inline
flow lists from a genuine agent tool call, and three-space indentation, where an
`indent % 2 !== 0 → skip` guard dropped every odd-indented line and reported a valid document as
containing 0 items. Anchors, aliases, multi-document streams and explicit type tags remain out of
scope. See `tests/yaml-robustness.spec.mjs`.)*

*(Amended again, issue #76.* "Flow maps... including nested ones," above, held for a flow map used as a
**value** (`amount: {type: number}`) but not for one used as a **list item** —
`relationships:\n  - {name: r, from: A, to: B}`, exactly the shape a relationships list invites. The
list branch tried `splitYamlKeyValue()` on the item's raw text before ever checking whether it was a
flow collection, so it split on the first colon *inside* the braces and returned a plausible-looking but
wrong `{"{name": "r, from: A, to: B"}` — no error, and the relationship's `name`/`from`/`to` all came
back `undefined`, so `commitYamlImport()`'s undeclared-endpoint guard silently dropped the entry. Same
"looks like nothing happened" failure class as the two bugs above. Fixed by checking for a
brace-delimited item before the key/value split, routing it to the same `parseYamlValueToken()` flow-map
parsing the value case already used. See `tests/yaml-robustness.spec.mjs` and
`tests/agent-ontology-phase-g.spec.mjs`.)*

**Entry point:** the existing "Import from TXT" toolbar button and its file-input/drag-drop accelerator,
relabeled **"Import"** (both languages) since it now recognizes two formats by extension — `.yaml`/`.yml`
routes to the Domain Model importer below, everything else (including `.txt`) to the existing TXT
importer, unchanged. No new toolbar button, matching Decision #4's "minimize new UI surface" reasoning
for the export side.

*(Amended after implementation: the same entry point now recognizes a third format, the canonical
`.json` of `spec.md` §5.5, and routing consults file content as well as extension — `spec.md` §5.6 has
the full rule. The `.yaml`/`.yml` → Domain Model routing described here is unchanged.)*

**Merge/replace semantics (Decision #10) — the one open design question Phase G started with:**
deliberately more aggressive than the base app's own TXT node/edge merge, which never touches a matched
node/edge's fields. Here:
- **Merge:** every class/relationship/rule/action in the file is applied — if something matching
  already exists on canvas, its fields are **overwritten wholesale** with the file's values (not merged
  field-by-field, not left untouched); if nothing matches, it's created. Nothing already on canvas but
  absent from the file is ever removed.
- **Replace:** same as Merge, plus anything on canvas that isn't mentioned in the file at all — for any
  of the four collections — is removed.
- This reuses the exact same two-button (`Merge`/`Replace`) dialog and diff-summary UI as TXT import —
  no new confirmation flow — just fed by a different parser/planner pair and a different (more
  aggressive) commit semantic. The diff summary itself is phrased generically across the four
  heterogeneous collections ("N item(s) would be added, M existing item(s) would be updated") rather than
  breaking out per-collection counts, mirroring the TXT summary's own simplicity.

**Matching rules** (what counts as "the same" class/relationship/rule/action across an import):
- Classes: node label === the YAML's class key, exactly.
- Rules: rule name === the YAML's rule key, exactly.
- Actions: action name === the YAML's action key, exactly.
- Relationships: an existing edge matches a `relationships` list entry when its endpoints' current
  labels equal the entry's `from`/`to` **and** `toCamelCaseId(edge.relation) === entry.name`. A matched
  edge's `relation` text is itself overwritten to the entry's literal `name` (not just its `meaning`) —
  an honest consequence of Section 5's chosen export shape, which stores only the derived camelCase name,
  not the original human-phrased relation label; re-importing necessarily normalizes toward that name.
  `toCamelCaseId()` had to be made idempotent for this to work correctly across a re-import (see the
  dated Log entry in `agent_ontology_todo.md` for the bug this fixes): re-deriving from an already-
  camelCase string (e.g. one this importer already normalized) must reproduce that same string, not
  flatten it further, or a second import would fail to recognize its own prior normalization and
  duplicate the edge instead of matching it.

**Competency questions (issue #94).** Accepted only with non-empty `text`; a missing `id` is minted at
commit time (never at parse time — the preview must not advance a counter for a dialog the user may
cancel), and an incoming id that matches nothing is honoured as-is, with `nextCqNum` lifted clear of any
`cqN`-shaped id so a later mint can never collide with it. Matching is by id; failing that, an entry
with **no** id whose trimmed text is already present is treated as the same question rather than an
obvious duplicate. That fallback is defensive interoperability with an external producer that emits text
without ids — it is not semantic duplicate detection, which stays out of scope. Merge/agent-merge
add-or-update; Replace additionally removes questions the file does not mention, exactly like the other
sections. A file containing **only** `competency_questions` is valid import input, so an external
requirements process can seed a fresh model with nothing else in the file.

**Commit order:** classes, then rules, then relationships, then actions — regardless of the order those
sections actually appear in the source file, since relationships reference classes by label and actions
reference both classes and rules. A relationship or action referencing a class/rule that isn't declared
anywhere in the file and doesn't already exist on canvas is skipped defensively (same posture
`planTxtImport()`/`commitTxtImport()` take for a TXT edge referencing an undeclared node label), not
treated as an error.
