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
     on the *correct* class/pair/name instead.
  2. The underlying concept is right but was named or shaped more
     specifically than the evidence supports (e.g. a property named too
     broadly for what the evidence actually justifies, or an `allowed`
     list that needs narrowing to what's actually grounded).
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
  `reground` nor `replace` worked.

Every `reground`/`replace` decision needs the same provenance rigor as the
original compile: `source_evidence` (a short quoted snippet, or an explicit
standard-practice statement tied to the specific classes involved),
`confidence` (`high`/`medium`/`low`), `rationale` (one sentence). Do not
invent evidence that is not either a direct quote from what you were given
or a standard-practice claim tied to the specific named classes in scope —
the same bar as the original compiler prompt, not a lower one just because
this is a repair.

## Output contract

Respond with **exactly one JSON object**, no prose, no markdown fences:

```json
{
  "repairs": [
    {
      "target_path": "relationships[40]",
      "action": "reground",
      "source_evidence": "...",
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
