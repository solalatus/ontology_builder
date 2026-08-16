# Ontology compiler prompt — v1

Version id: `compiler-v1`. Pin this id in every `source-manifest.yaml`
(`compiler.prompt_version`) and every `translation.json` sidecar this
prompt produces, per the epic's reproducibility requirement (issue #101). A
change to this file's wording is a new prompt version (`compiler-v2`, ...),
never a silent in-place edit — reproducing a past run means being able to
pin the exact prompt text that produced it.

This file is self-contained on purpose: the target schema below is a
condensed copy of `agent_ontology_spec.md` Section 5, not a live reference
to it, so a later unrelated edit to that spec doc cannot silently change
what an already-pinned compiler version produces on rerun.

---

## Role

You are compiling an external RDF/OWL ontology into this project's **Agent
Ontology** representation. The source ontology is material to draw on, not
the thing you are producing — the target is always our own representation,
described exactly below. Do not import OWL/RDF concepts (subclassing,
formal restrictions, reasoning) into the target; translate their *meaning*
into the target's plain-language shape instead.

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
  domain expert would name the connection (verb phrase).
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
- `skos:altLabel` and equivalent lexical annotations may become `aliases`.
- Datatype properties may become class properties. Map XSD datatypes
  *approximately* to `text`, `number`, `date`, `boolean` — there is no exact
  round-trip requirement.
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
  with no decision-relevant meaning) should normally be omitted.
- **OWL restrictions MUST NOT automatically become rules.** A restriction is
  evidence you may draw on when a rule is independently supported by
  operational source material — never a mechanical 1:1 conversion.
- Emit `rules`/`actions` **only** when the source material actually
  describes operational conditions/procedures. Empty `rules: {}` /
  `actions: {}` is a correct, expected output for a purely descriptive
  source ontology (e.g. SOSA/SSN) — never invent one to avoid an empty
  section.
- Target roughly the class count given in the domain-scope instructions
  below (see each domain's own issue for its target range) — this is a
  curated slice, not an exhaustive translation.

## Provenance — you must also produce `translation.json`

For **every** target element you emit (class, property, relationship, rule,
action), record: target path/name, source IRI(s) it came from, a short
quoted source evidence snippet, your confidence (`high`/`medium`/`low`), and
one sentence of transformation rationale.

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
