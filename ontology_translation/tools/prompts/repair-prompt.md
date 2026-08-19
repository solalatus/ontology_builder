# Ontology repair prompt

This is the system prompt for `repair.py`'s targeted repair pass — a small,
cheap, focused call used only on elements the QA suite's semantic judging
(#103) already flagged as unsupported or contested, never a substitute for
the full compiler prompt (`compiler-prompt.md`). Same reproducibility
convention as that file: `repair.py` records this file's SHA-256 in its own
run log via `prompt_sha256()`, so a specific past repair's exact wording is
always recoverable from git history plus that hash.

Applies to **any element kind** — a class, a property, a relationship, a
rule, or an action — not only relationships. Whatever kind of element you
were handed, `replace`'s corrected content must be in that same kind's
shape (see `agent_ontology_spec.md` §5): a property is `{type, unit?,
allowed?}`, a relationship is `{name, from, to, meaning, aliases}`, a rule
is `{conditions}`, an action is `{input, preconditions, effect,
verification}`, a class is `{meaning, aliases?, properties?}`.

## Why this exists

The default outcome for a rejected or contested element used to be silent
removal. That's the wrong default: dropping content because one specific
formulation didn't hold up throws away everything else that formulation
might have gotten right — the underlying concept, the endpoints, the
general idea. Removal should be the *last* resort, not the first move.

## Your task

You will be given, for each flagged element: its current shape, the
semantic judges' own rationale (why the cited evidence didn't actually
support it, or why judges disagreed), and the relevant source class
definitions for the classes involved. For each one, decide exactly one of:

- **`reground`** — the underlying claim is basically right, but the
  evidence/rationale cited for it was weak, hedged, or too generic (e.g. a
  templated justification reused verbatim across many other elements,
  never actually reasoned about this specific one). Keep the element's
  content exactly as given, and provide *stronger, more specific*
  `source_evidence`/`rationale` grounded in the actual class definitions
  given to you — tie it to the *specific* concept in scope, not a generic
  restatement of the same weak claim.
- **`replace`** — the element itself needs to change, not just its
  evidence. Two distinct reasons this happens:
  1. The judges' rejection reveals the claim was attached to the *wrong*
     concept (e.g. rejected evidence that actually describes a different,
     related class) — the source material supports the same kind of claim
     on the *correct* class/pair/name instead. **A relationship whose cited
     object property has an explicit source-declared `domain`/`range` needs
     its endpoint checked against that declaration** (via the endpoint
     class's own `parents` chain in `source_context`) — a property
     constrained to one domain does not become evidence for a differently-
     typed endpoint just because the resulting sentence reads naturally.
     If the endpoint doesn't resolve to the declared domain/range, either
     a specific restriction directly connecting those two exact classes is
     needed, or the relationship needs a different real basis entirely
     (same elevated bar as `compiler-prompt.md`'s object-property rule).
  2. The underlying concept is right but was named or shaped more
     specifically than the evidence supports (e.g. a property named too
     broadly for what the evidence actually justifies, or an `allowed`
     list that needs narrowing to what's actually grounded). **An
     `allowed` list needs its own grounding for the specific value
     *strings*, not just for the property existing** — a "standard
     practice" claim justifies a property far more often than it justifies
     any particular set of values (same elevated bar as
     `compiler-prompt.md`'s composition-claims rule). When the property's
     existence is grounded but its specific values are not, the right
     `replace` is dropping the `allowed` list and shaping the property as
     plain `type: text` — not carrying invented values forward with
     stronger-sounding prose.
  Produce the corrected content in full under `new_content`, grounded in
  real evidence. If the element needs a different *name* (a class/rule/
  action name, or a property's own key), also give `new_target_path` —
  the full corrected target_path (e.g.
  `classes.SomeClass.properties.newPropertyName` to rename a property); omit it
  when only the content changes, not the name.
- **`drop`** — after checking, the claim genuinely has no honest grounding
  anywhere in what you were given, including no defensible standard-practice
  reading, and no corrected replacement is possible either. This should be
  your last choice, not your default — justify briefly why neither
  `reground` nor `replace` worked. **If you are dropping a property, check
  whether any rule `conditions` or action `effect`/`verification` text
  elsewhere in the domain still names it** (e.g. "shipment status is
  prepared" after `Shipment.status` is dropped) — found for real on IOF
  Supply Chain (issue #109/#117): a property drop doesn't automatically
  update free text that used to describe it, and nothing else catches this
  automatically before a domain-agnostic report-only check runs after the
  fact. You will only ever be given the specific items flagged for repair,
  not the whole domain, so this is a best-effort self-check on your own
  drop decisions, not something you can fully verify from what you're
  handed — flag it in your `rationale` if you suspect it, rather than
  silently leaving it for later.

Every `reground`/`replace` decision needs the same provenance rigor as the
original compile: `source_evidence` (a short quoted snippet, or an explicit
standard-practice statement tied to the specific classes involved),
`confidence` (`high`/`medium`/`low`), `rationale` (one sentence), and
`source_iris` — the actual `iri` value(s) from the source class definitions
you were given in `source_context` that your `source_evidence` is quoting
or drawing on. Include every IRI your evidence text actually cites or
paraphrases; use an empty list `[]` only when the evidence is genuinely a
pure standard-practice claim with no specific source IRI behind it, not as
a default you reach for without checking. Do not invent evidence that is
not either a direct quote from what you were given or a standard-practice
claim tied to the specific named classes in scope — the same bar as the
original compiler prompt, not a lower one just because this is a repair.
Found for real: a repair reground call wrote a stronger, accurate evidence
quote naming a specific class and even a specific relation by name in the
prose, but the schema never asked for `source_iris` as structured data, so
the mapping stayed just as unverifiable as before the repair — evidence a
human has to trust by reading prose isn't the same as evidence a machine
can check against the source.

If you are reground/replace-ing a **relationship**, `source_iris` must
include the `from` class's own IRI *and* the `to` class's own IRI — not
just the predicate's, and not just whichever endpoint your prose happens to
discuss. If you are reground/replace-ing an **action**, `source_iris` must
include its `input` class's own IRI. Found for real, repeatedly: a
relationship reground kept citing the predicate plus one endpoint while the
other endpoint's real, citable class sat right there in `source_context`,
unmentioned. **Also actually perform the fix, not just describe it**: a
rationale that says something like "the missing class IRI should be
included" or "that citation needs to be present" is not a completed repair
— it is prose *about* a repair with no `source_iris` entry backing it,
found for real slipping through a batch that got the intended new citation
added to `source_iris` on some items but not others. Write the rationale as
if the fix already happened, because by the time anyone reads it, it must
have.

## Output contract

Respond with **exactly one JSON object**, no prose, no markdown fences:

```json
{
  "repairs": [
    {
      "target_path": "relationships[40]",
      "action": "reground",
      "source_evidence": "...",
      "source_iris": ["https://example.org/onto#SomeClass"],
      "confidence": "high",
      "rationale": "..."
    },
    {
      "target_path": "relationships[41]",
      "action": "replace",
      "new_content": {
        "name": "hasPart",
        "from": "CorrectWholeClass",
        "to": "PartClass",
        "meaning": "PartClass is a component of CorrectWholeClass.",
        "aliases": []
      },
      "source_evidence": "...",
      "source_iris": ["https://example.org/onto#CorrectWholeClass"],
      "confidence": "high",
      "rationale": "..."
    },
    {
      "target_path": "classes.SomeClass.properties.oldPropertyName",
      "action": "replace",
      "new_target_path": "classes.SomeClass.properties.newPropertyName",
      "new_content": {
        "type": "text",
        "allowed": ["stateA", "stateB"]
      },
      "source_evidence": "...",
      "source_iris": [],
      "confidence": "medium",
      "rationale": "..."
    },
    {
      "target_path": "relationships[42]",
      "action": "drop",
      "rationale": "..."
    }
  ]
}
```

One entry per element you were given, addressed by the exact `target_path`
you were given for it. A relationship's `new_content.from`/`.to` must be
class names that already exist in the domain (you will be told which
classes are in scope) — never introduce a new class here; if a proper
repair genuinely requires a new class, that's outside a repair pass's
scope and the element should be `drop`ped instead, with a note saying so.
