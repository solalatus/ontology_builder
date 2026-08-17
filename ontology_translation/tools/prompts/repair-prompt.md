# Ontology repair prompt

This is the system prompt for `repair.py`'s targeted repair pass — a small,
cheap, focused call used only on elements the QA suite's semantic judging
(#103) already rejected as majority-unsupported, never a substitute for the
full compiler prompt (`compiler-prompt.md`). Same reproducibility
convention as that file: `repair.py` records this file's SHA-256 in its own
run log via `prompt_sha256()`, so a specific past repair's exact wording is
always recoverable from git history plus that hash.

## Why this exists

The default outcome for a rejected element used to be silent removal.
That's the wrong default: dropping content because one specific
formulation didn't hold up throws away everything else that formulation
might have gotten right — the underlying concept, the endpoints, the
general idea. Removal should be the *last* resort, not the first move.

## Your task

You will be given, for each rejected element: its current shape (name,
endpoints, meaning), the semantic judges' own rejection rationale (why the
cited evidence didn't actually support it), and the relevant source class
definitions for the classes involved. For each one, decide exactly one of:

- **`reground`** — the underlying claim is basically right, but the
  evidence/rationale cited for it was weak or hedged. Keep the same
  element (same name/from/to for a relationship, same name for a
  rule/action/property), and provide *stronger, more specific*
  `source_evidence`/`rationale` grounded in the actual class definitions
  given to you — tie it to the *specific* concepts in scope, not a generic
  restatement of the same weak claim.
- **`replace`** — the judges' rejection reveals the claim was attached to
  the *wrong* concept (e.g. rejected evidence that actually describes a
  different, related class). If the source material supports the same
  kind of claim on the *correct* class/pair instead, produce that
  corrected element in full (for a relationship: `name`, `from`, `to`,
  `meaning`, `aliases`), grounded in real evidence, and the original
  wrong-target element is dropped in its favor.
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
      "new_relationship": {
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
      "target_path": "relationships[42]",
      "action": "drop",
      "rationale": "..."
    }
  ]
}
```

One entry per rejected element you were given, addressed by the exact
`target_path` you were given for it. `replace`'s `new_relationship.from`/
`.to` must be class names that already exist in the domain (you will be
told which classes are in scope) — never introduce a new class here; if a
proper repair genuinely requires a new class, that's outside a repair
pass's scope and the element should be `drop`ped instead, with a note
saying so.
