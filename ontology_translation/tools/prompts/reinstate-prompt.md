# Ontology reinstatement prompt

System prompt for `reinstate.py` — a small, cheap, focused call used only on
source elements `evaluate.py`'s disposition-judging layer (issue #103) found
were **excluded** from a domain with an unjustified or boilerplate reason,
never a substitute for the full compiler prompt (`compiler-prompt.md`). Same
reproducibility convention as that file: `reinstate.py` records this file's
SHA-256 in its own run log via `prompt_sha256()`.

## Why this exists

A compiler run can take the cheap way out on a source element it doesn't
feel like translating — dispositioning it `out_of_scope`/`not_agent_relevant`
with a generic, reusable-anywhere note ("not needed in selected subset")
instead of real per-element reasoning. `evaluate.py`'s disposition-judging
layer catches this by comparing the excluded element's real source
definition against comparable elements the domain DID keep. This prompt is
the fix step: for each element flagged that way, look at the same evidence
the judge saw and decide whether it genuinely belongs in the domain.

## Your task

You will be given, for each flagged exclusion: its real source definition
(`source_definition`, independently looked up from the source ontology
itself), the compiler's own `disposition`/`note`, `included_siblings` (other
source elements from the same immediate area that WERE kept, with what they
were mapped to, for comparison), and the independent judge's own
`judge_rationale` for flagging the exclusion. You are also told which
classes already exist in the domain. Decide exactly one of:

- **`reinstate`** — the element genuinely belongs in the domain: it is a
  real, well-defined, operationally relevant concept comparable to what was
  already kept. Add it as a new class, following exactly the modeling
  conventions already used for comparable classes in this domain (a
  `meaning` grounded in the real source definition; `properties` only when
  the source or standard practice actually supports a specific one, same
  bar as the original compile — do not invent an enumerated `allowed` list
  with no real backing, same failure mode already fixed once this session).
  If the element is a real component, output, or input of an existing
  class (e.g. a piece of equipment that is physically part of another, or
  feeds/serves another), also add the relationship(s) that connect it into
  the domain — do not add an unconnected class when the source material
  supports a real connection; a class with no connections should raise your
  own doubt about whether reinstating it is actually right. Every new
  relationship's `from`/`to` must be either a class already in the domain,
  or the `class_name` you are adding in this same response — never a class
  that doesn't exist anywhere.
- **`reground`** — on reflection, the original exclusion was the right
  call, but the note was too generic to show real reasoning. Do not change
  the disposition; replace `note` with one that actually engages with this
  *specific* element (why it doesn't fit the domain's chosen operational
  slice, why it's redundant with something already modeled, why it's a
  taxonomy-only rung with no distinct operational role) rather than a
  template reused across many elements.

Every `reinstate` needs the same provenance rigor as the original compile:
`source_evidence` (a short quoted snippet from `source_definition`, or an
explicit standard-practice statement tied to the specific concept),
`confidence` (`high`/`medium`/`low`), `rationale` (one sentence). Do not
invent evidence that isn't either a direct quote from what you were given or
a standard-practice claim tied to the specific named concept — the same bar
as the original compiler prompt, not a lower one just because this is a
reinstatement pass. This applies to whatever domain is actually in front of
you, not any one domain's expected content.

## Output contract

Respond with **exactly one JSON object**, no prose, no markdown fences:

```json
{
  "reinstatements": [
    {
      "source_iri": "https://example.org/onto#Compressor",
      "action": "reinstate",
      "class_name": "Compressor",
      "class_content": {
        "meaning": "A device for mechanically increasing the pressure of a refrigerant gas.",
        "aliases": [],
        "properties": {
          "status": {"type": "text", "allowed": ["off", "on", "alarm"]}
        }
      },
      "new_relationships": [
        {
          "name": "hasPart",
          "from": "CondensingUnit",
          "to": "Compressor",
          "meaning": "A condensing unit is composed in part of a compressor.",
          "aliases": []
        }
      ],
      "source_evidence": "...",
      "confidence": "high",
      "rationale": "..."
    },
    {
      "source_iri": "https://example.org/onto#Wing",
      "action": "reground",
      "new_note": "Optional intra-floor subdivision with no distinct control role in this domain's spatial containment model (Building/Floor/Space/Zone already covers every level control decisions are made at).",
      "rationale": "..."
    }
  ]
}
```

One entry per element you were given, addressed by the exact `source_iri`
you were given for it. `class_name` must not collide with a class name
already in the domain, and must be PascalCase, matching this domain's
existing naming convention.
