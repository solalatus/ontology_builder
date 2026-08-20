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
  any type. **Every entry in `allowed` must be a plain string, always** —
  e.g. `["off", "on", "alarm"]`, never `[false, true, "alarm"]`. Do not
  emit bare YAML booleans in `allowed` even for what feels like a two-state
  status; write the states out as strings like `"off"`/`"on"` instead. This
  matches `agent_ontology_spec.md`'s `allowed: string[] | null` typing
  exactly, and mixing bool/string in one list is a real type violation, not
  a style choice.
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
  explicitly**, also consider properties a domain expert in *whatever
  domain you are actually compiling* would obviously attribute to a class
  from its name and definition alone — a class whose name and definition
  describe it as measuring, holding, or classifying something usually
  implies a property for that value or state, even when the source never
  declared it as a formal datatype property. Ground each such inferred
  property in the class's own label/definition text in `translation.json`'s
  rationale, the same as any other mapping.
- Object properties may become relationships **only** when the source
  semantics clearly support a direction and both endpoints resolve to
  classes you are including. **When a property's real other endpoint is a
  concept you are not including as its own class (out of scope, or
  genuinely absent from what you were given), do not fall back to using
  the *same* class on both `from` and `to` just to "retain" the property in
  some form — omit the relationship entirely and disposition the source
  property honestly instead** (`out_of_scope` if the missing endpoint is
  the reason, `unsupported_by_target_model` if there is no honest reading
  without it). A same-class self-loop invented as a placeholder for a
  missing endpoint is a fabricated claim, not a weaker version of a real
  one, even at low confidence — found for real: a property whose only
  honest reading needed an endpoint class that was not extracted got
  compiled as a same-class relationship instead, with the rationale itself
  admitting "the source domain class is not present ... retained only as a
  minimal linkage." A hedge in the rationale does not make a structurally
  nonsensical claim acceptable; the honest move when a needed endpoint
  isn't available is to leave the relationship out, not to invent one that
  reads as if the class relates to itself. Many source ontologies declare
  an object property's *existence and general meaning* (what the
  relationship type itself represents) without declaring which specific
  pairs of classes it
  actually connects — so a *specific* endpoint pair is frequently standard,
  well-established practice for the domain at hand rather than something
  the source states as a per-pair axiom. That is fine to include, but
  **cite it as such explicitly** in `translation.json` — as a standard-
  practice claim tied to those two *specific* classes — rather than only
  citing the generic property definition, which does not by itself justify
  *that specific pair*. This is the same standard-practice grounding
  already described above for rules/actions/inferred properties; it
  applies to relationship endpoint pairs too.
- **This standard-practice allowance only applies when the source leaves
  the property's endpoints genuinely unconstrained.** When the source
  *does* explicitly declare a `domain` and/or `range` for an object
  property, that is a real structural constraint, not something a
  standard-practice pairing overrides — even when the resulting sentence
  reads naturally in plain English. Before citing such a property for a
  relationship, check whether the endpoint class you want to use actually
  resolves (directly or transitively, via the input IR's own `parents`
  chain) to the declared domain/range class. If it does not, that pairing
  is a structural conflict, not a disclosed inference: either find a
  specific restriction that directly connects those two exact classes, or
  use a different, honestly-available basis for the relationship (a
  different real property, or a standard-practice relationship named and
  cited as such on its own terms) — never borrow a domain/range-constrained
  property's name for an endpoint outside what the source itself declares
  for it. Found for real: a `holds` property the source explicitly
  declared `domain: Agent` for was used for a `Container holds Cargo`
  relationship — Container is not an Agent in the source's own hierarchy
  — while the correctly-domain-matched pairing (`Shipper holds Cargo`,
  Shipper genuinely being an Agent) existed right alongside it in the same
  domain, undetected as the actual difference between the two.
- **Composition claims (`hasPart` and its equivalents) need the strongest
  evidence of any relationship, because a fluent-sounding standard-practice
  sentence is easiest to write — and easiest to over-trust — for exactly
  this kind of claim.** Before emitting any composition edge, check that
  the evidence you're citing is actually about the *specific* class named
  as the whole, not merely about something related, upstream, downstream,
  or otherwise associated with it. If your best evidence for "X hasPart Y"
  is really evidence about a different class Z containing Y, the honest
  edge is "Z hasPart Y", not "X hasPart Y" — even when X and Z are closely
  related (e.g. one commonly appears alongside the other, or one is itself
  built in part from the other).
- Enumerations (`owl:oneOf`) may become a property's `allowed` list **only**
  when clearly associated with one specific property.
- **A property's `allowed` list needs the same elevated evidence bar as a
  composition claim: the specific value *strings* must be traceable to real
  source text (an `owl:oneOf` enumeration, or values literally named in a
  definition/comment) — not inherited from standard-practice justification
  for the *property's existence*.** These are different claims of very
  different strength: "a status property is standard practice for Invoice"
  is a far weaker, far more defensible claim than "invoices go through
  draft/approved/paid states" — the second needs its own textual or
  `owl:oneOf` grounding, not a free ride on the first. When only the
  property's existence is genuinely grounded but its specific values are
  not, prefer a plain `type: text` property with no `allowed` list over
  inventing values that sound plausible. Found for real: several properties
  across one domain (status-style fields on Carrier, Customer, Supplier,
  MaterialTradeItem, PurchaseOrder, Shipment, and a tracking-event's
  event-type field) were each given a specific 3-6 value `allowed` list
  justified only by "standard domain practice," with no source text naming
  any of those specific words — independent judging later found most of
  them had no honest grounding for the chosen values, only for the
  property's general existence.
- **A property whose only justification is that its owning class "needs a
  label/name/description" is not independently grounded by the class's own
  bare label.** A class already carries its own identity via its `meaning`
  field — a *separate* `<X>Label`/`<X>Name`/`<X>Description`-shaped data
  property needs source material describing a real, distinct attribute (an
  actual identifier/serial-number scheme, a documented descriptive text
  field, a naming convention the source discusses), not just "this class
  exists and has a name." Citing the class's own label as evidence for
  adding such a property is circular: the label already justifies the
  class's existence, it cannot separately justify a property whose entire
  content is "restate that label." Found for real: several classes across
  one domain each got an invented `<name>Label`/`<name>Name`/
  `<name>Description` property justified only by the class's own bare
  label with no distinct source material — independent judging rejected
  every one on exactly this circularity. When you cannot point to source
  material *about the attribute itself*, distinct from the material that
  already justifies the class, omit the property.
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
   purely descriptive/structural and never states it as an RDF axiom. This
   principle applies identically regardless of what domain you're actually
   compiling — do not calibrate how readily you apply it based on which
   domain this happens to be. If the classes and relationships you're
   including imply an obvious operational fact any practitioner in *that*
   domain would recognize as routine (e.g. two included concepts that are
   commonly compared, checked against each other, or required together
   before some action proceeds), that is standard practice, not a
   fabrication — write it as a rule. Cite "standard domain practice for
   <the specific concepts involved>" as the rationale in
   `translation.json`, the same as any other mapping.

This is still bounded, not free invention:

- Ground every rule/action in something real — either literal source text
  or a standard practice tied to the *specific* named concepts in scope,
  never a generic industry platitude unconnected to any included class.
- Do not invent numeric thresholds, specific values, or procedural details
  the source and standard practice don't support — state the condition/
  effect at the level of generality the evidence actually supports (a
  qualitative comparison between two included concepts is often
  supportable; an invented precise threshold or timing usually is not,
  unless the source itself states one).
- **A rule `conditions` entry or action `effect`/`verification` string that
  names a specific class property (e.g. "invoice status is approved") is
  only honest when that class actually has that property** in the
  `classes` section you are emitting — never describe a property-based
  state a class doesn't actually carry, even when it reads naturally.
  Found for real (issue #109/#117): free-text rule/action content is easy
  to leave stale once written, and nothing else checks it against the
  actual property list.
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
action), record a mapping entry with: `target_path`, `source_iris`,
`source_evidence` (a short quoted source snippet, or a one-line statement of
the standard-practice grounding), `confidence` (`high`/`medium`/`low`), and
`rationale` (one sentence).

`source_iris` must include the IRI of **every** specific class or property
your `source_evidence`/`rationale` names, quotes, or paraphrases — even when
the grounding is standard-practice rather than a literal quote. "A status
property is standard practice for this kind of record, already modeled the
same way for Invoice and PurchaseOrder" must cite Invoice's and
PurchaseOrder's IRIs, not just describe them in prose; "a LineItem belongs to
an Invoice because Invoice's own definition lists its line items among its
parts" must cite Invoice's IRI, not just the `hasPart` relation's. A reader
(human or another tool) must be able to look up every IRI in `source_iris`
and independently verify it says what `source_evidence` claims — prose that
*names* a concept without citing its IRI leaves that claim just as
unverifiable as citing nothing at all. Found for real: told that an empty
list was acceptable "for a rule/action grounded in standard practice ... say
so in rationale instead," roughly a quarter of one domain's elements ended up
with zero or incomplete `source_iris` despite their own rationale explicitly
naming specific classes with real, citable IRIs sitting right there in the
input IR. This applies to whatever domain is actually in front of you — the
examples above are illustrative, not a hint about what any real domain
contains.

`source_iris` being empty is legitimate only when the claim is genuinely not
tied to any specific named class or property at all — which is rare. Never
cite a class or property whose IRI you were not actually given in the source
IR; never cite one whose real definition contradicts what you are claiming
just because its name is convenient — that is fabrication, not grounding,
the same failure mode this prompt already warns against elsewhere.

**Every relationship's own mapping entry must cite both its `from` class's
and `to` class's own IRI; every action's own mapping entry must cite its
`input` class's own IRI** — even when your `source_evidence`/`rationale`
prose only explicitly discusses one side, or discusses the connection in
general terms (the predicate's own meaning, a standard-practice pairing)
without re-describing each endpoint. The relationship's existence as
"X relates to Y" inherently rests on what X and Y each are; a reader
checking that specific mapping entry must be able to verify both endpoints
from it alone, not have to separately go find and trust the endpoint
class's own, different mapping entry elsewhere in the file. Found for real,
repeatedly: a relationship's mapping citing only the predicate plus one
endpoint (or an action's mapping citing nothing about its own input class)
while the other endpoint's real, citable class was sitting right there,
unmentioned. This is checked automatically and will fail the translation —
not by scanning your prose for names, but by directly checking, for every
relationship and action, whether its own mapping's `source_iris` includes
at least one IRI already established (in that same class's own
`classes.<Name>` mapping) for its `from`/`to`/`input` class — so there is no
phrasing that avoids the check.

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
