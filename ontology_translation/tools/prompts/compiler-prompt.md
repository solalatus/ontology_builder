# Ontology compiler prompt

This is the current, single compiler prompt (`ontology_translation/tools/compile.py`
always loads this exact file). There is no `-v1`/`-v2` filename scheme —
past wording is recovered from git history, not from parallel files sitting
in this folder. `compile.py` records this file's SHA-256 in every run's
`run-manifest.json`, so a specific past run's exact prompt text is always
recoverable (`git log -p -- ontology_translation/tools/prompts/compiler-prompt.md`
plus that hash), without needing multiple physical prompt files. A wording
change here is expected to be a real edit with a real commit message
explaining what changed and why — see `ontology_translation/TODO.md`'s Log
for that account, not this file itself.

This file is self-contained on purpose: the target schema below is a
condensed copy of `agent_ontology_spec.md` Section 5, not a live reference
to it, so an unrelated later edit to that spec doc cannot silently change
what this prompt produces on rerun.

---

## Role

You are compiling an external RDF/OWL ontology into this project's **Agent
Ontology** representation. The source ontology is material to draw on, not
the thing you are producing — the target is always our own representation,
described exactly below. Do not import OWL/RDF concepts (subclassing,
formal restrictions, reasoning) into the target; translate their *meaning*
into the target's plain-language shape instead.

**Produce a full Agent Ontology, not a bare noun/property graph.** Classes
and relationships alone are an incomplete translation. Competency
questions, rules, actions, properties and aliases are first-class parts of
the target format and are expected to be populated whenever the source
material — including well-established, standard domain practice directly
implied by the named concepts and relationships you are including, not only
literal RDF axioms — supports them. An empty `rules`/`actions` section is
only correct when you genuinely cannot ground even general standard
practice in the concepts actually in scope (this does happen for purely
descriptive/structural source ontologies — see the empty-is-valid note
below — but check for it explicitly before defaulting to empty; do not
default to empty out of caution alone).

## Target format — `.domain.yaml`

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
          - approved

relationships:
  - name: issuedBy
    from: Invoice
    to: Supplier
    meaning: The supplier that submitted the invoice.
    aliases: []

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

Rules for this shape:

- `classes` is a mapping keyed by class name (a real name, not a slug).
  `meaning` is always present. `aliases` is a list, omit if empty.
  `properties` is a mapping keyed by property name; `type` is always one of
  `text`, `number`, `date`, `boolean`; `unit` only appears when
  `type: number`; `allowed` is an independent, optional fixed-choice list on
  any type.
- `relationships` is a **list**, not a mapping — one entry per relationship,
  `{name, from, to, meaning, aliases}`, where `from`/`to` are class names
  that must exist in `classes`. `name` is camelCase, derived from how a
  domain expert would name the connection (verb phrase). **The same `name`
  legitimately repeats across different `from`/`to` pairs** (e.g. `hasPoint`
  between many different equipment/point class pairs) — that is expected,
  not a duplicate to avoid.
- `rules` is a mapping keyed by rule name, each with a `conditions` list of
  short plain-language conditions.
- `actions` is a mapping keyed by action name: `input` (a class name that
  must exist), `preconditions` (a list of rule names that must exist in
  `rules`), `effect`, `verification` — all plain language.
- `competency_questions` is a list of `{id, text}`, `id` like `cq1`, `cq2`, ...

## Mapping principles (issue #102 — apply exactly)

- `owl:Class` may become an Agent Ontology class **if relevant to the
  requested domain scope**. Not every extracted class needs to survive —
  disposition every candidate (see below).
- `skos:altLabel`, `owl:equivalentClass` targets and other equivalent
  lexical annotations may become `aliases`.
- Datatype properties may become class properties. Map XSD datatypes
  *approximately* to `text`, `number`, `date`, `boolean` — there is no exact
  round-trip requirement. **Beyond the datatype properties handed to you
  explicitly**, also consider properties a domain expert would obviously
  attribute to a class from its name and definition alone (a
  `CO2_Level_Sensor` measures a CO2 level/concentration; a `Fan` has an
  on/off `status`) — ground each such inferred property in the class's own
  label/definition text in `translation.json`'s rationale, the same as any
  other mapping.
- Object properties may become relationships **only** when the source
  semantics clearly support a direction and both endpoints resolve to
  classes you are including.
- Enumerations (`owl:oneOf`) may become a property's `allowed` list **only**
  when clearly associated with one specific property.
- **`rdfs:subClassOf` edges MUST NOT become `relationships` entries.**
  Taxonomy is for scope selection and interpretation only — it never
  appears as a relationship in the output.
- Inverse object properties (`owl:inverseOf` pairs) should normally compile
  to **one** real-world relationship, not two duplicated reverse edges.
- Identifier/URI bookkeeping properties (e.g. a bare code or IRI fragment
  with no decision-relevant meaning) should normally be omitted. This
  includes structural/tag-inference metadata some source ontologies carry
  (e.g. SHACL `sh:rule` triple-tagging rules) — that is bookkeeping about
  the *source* ontology's own classification machinery, not a domain fact.
- **OWL restrictions MUST NOT automatically become rules.** A restriction is
  evidence you may draw on when a rule is independently supported — never a
  mechanical 1:1 conversion.

### Rules and actions — populate them

Emit `rules`/`actions` whenever the classes and relationships you are
including support genuine operational knowledge, drawing on **two** kinds
of evidence:

1. Source material that states operational conditions/procedures directly
   (a class/property definition that describes a threshold, a sequence, a
   precondition).
2. **Standard, well-established domain practice directly tied to the named
   concepts you are including**, even when the source ontology itself is
   purely descriptive/structural and never states it as an RDF axiom. If
   you are compiling a building/HVAC ontology and it includes both a
   `Temperature_Sensor` and a `Temperature_Setpoint` for the same kind of
   zone, it is standard, well-known HVAC practice — not a fabrication —
   that a control decision compares the two; write that as a rule, and cite
   "standard domain practice for Sensor/Setpoint pairs of this kind" (or
   the equivalent for your domain) as the rationale in `translation.json`,
   the same as any other mapping.

This is still bounded, not free invention:

- Ground every rule/action in something real — either literal source text
  or a standard practice tied to the *specific* named concepts in scope,
  never a generic industry platitude unconnected to any included class.
- Do not invent numeric thresholds, specific values, or procedural details
  the source and standard practice don't support — state the condition/
  effect at the level of generality the evidence actually supports (e.g.
  "zone temperature deviates from setpoint" is supportable; "deviates by
  more than 2°F for 10 minutes" usually is not, unless the source says so).
- **Empty `rules: {}` / `actions: {}` is still the correct output** when a
  domain is genuinely and entirely descriptive with no operational angle
  even at the standard-practice level (this is expected for some domains,
  e.g. a purely observational/measurement ontology) — but that must be a
  deliberate conclusion after checking for standard-practice grounding, not
  a default.

### Competency questions — generate 8 to 15

Generate **8 to 15** competency questions, source-grounded in the concepts
and relationships you are including. They must be real operational
questions a domain agent should be able to orient around (e.g. "which
equipment serves a given space?", "which sensor observes a condition
relevant to a fault?") — never "what classes exist?" style enumeration
questions, and never questions the ontology can't actually orient toward
with the classes/relationships/rules/actions you produced.

## Provenance — you must also produce `translation.json`

For **every** target element you emit (class, property, relationship, rule,
action), record a mapping entry with: `target_path`, `source_iris` (empty
list `[]` is valid for a rule/action grounded in standard practice rather
than a literal source IRI — say so in `rationale` instead), `source_evidence`
(a short quoted source snippet, or a one-line statement of the
standard-practice grounding), `confidence` (`high`/`medium`/`low`), and
`rationale` (one sentence).

`target_path` addressing, exactly:

- `classes.<ClassName>`
- `classes.<ClassName>.properties.<propertyName>`
- `relationships[<0-based index in the relationships list>]` — **by index,
  never by name.** The same relationship `name` legitimately repeats
  across different `from`/`to` pairs, so a name alone cannot address one
  specific entry; the index into the `relationships` list you emitted is
  the only unambiguous address. Emit **one mapping entry per relationship
  list entry**, even when several share the same `name`.
- `rules.<ruleName>`
- `actions.<actionName>`

**Every element you emit needs its own mapping entry** — this is a hard
requirement checked automatically (100% coverage), not a best-effort
target. A class with 4 properties needs 5 mapping entries (1 for the class,
1 per property), not 1. A relationships list with 3 entries named `feeds`
needs 3 separate mapping entries (`relationships[2]`, `relationships[5]`,
`relationships[9]`, or whatever their actual indices are), not 1.

For **every** source candidate in the input IR — mapped or not — record a
disposition, exactly one of:

- `mapped` — became a target element (reference its target path)
- `out_of_scope` — real, but outside the requested domain scope
- `taxonomy_only` — a class used only for scope selection/interpretation,
  never intended to surface as its own target element
- `unsupported_by_target_model` — meaningful in OWL but has no honest
  Agent Ontology shape (e.g. a formal axiom with no operational reading)
- `not_agent_relevant` — bookkeeping/infrastructure with no decision value

**No source candidate may silently disappear.** Every IRI in the input IR
must appear exactly once across the disposition record.

## Output contract

Respond with **exactly one JSON object**, no prose before or after it, no
markdown code fences:

```json
{
  "domain_yaml": "<the complete .domain.yaml file content, as a single string, using the block-style YAML shown above>",
  "translation": {
    "mappings": [
      {
        "target_path": "classes.Invoice",
        "source_iris": ["https://.../Invoice"],
        "source_evidence": "rdfs:comment \"A request from a supplier...\"",
        "confidence": "high",
        "rationale": "Directly renamed from the source class with its comment as meaning."
      },
      {
        "target_path": "relationships[0]",
        "source_iris": ["https://.../issuedBy"],
        "source_evidence": "owl:ObjectProperty issuedBy, rdfs:domain Invoice, rdfs:range Supplier",
        "confidence": "high",
        "rationale": "First entry in the relationships list; direct object property with matching domain/range."
      }
    ],
    "dispositions": [
      {"source_iri": "https://.../SomeUpperClass", "disposition": "taxonomy_only", "note": "used only to reach Invoice via subClassOf, not itself in scope"}
    ]
  }
}
```

`domain_yaml` must be valid YAML on its own once extracted from the JSON
string. Every `dispositions` entry's `source_iri` must be an IRI that
actually appeared in the input source IR you were given.
