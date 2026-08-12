// POST-INTERVIEW STRUCTURAL NORMALIZER -- FROZEN PROMPT v1 (issue #75 §3-§6)
//
// This module holds the experimental normalizer's system prompt and the
// parsing/validation of what it returns. Nothing here is production code:
// index.html never imports it, the interviewer never sees it, and no code
// path in the shipped app can reach it.
//
// FROZEN. `POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1` is the pre-registered
// v1 (issue #75 §3: "Treat the first committed version as frozen experimental
// v1"). Its SHA-256 is recorded in every artifact this condition writes. If a
// later version is wanted after seeing v1's results, it becomes a separately
// named v2 constant in its own module and a separately named condition
// directory -- editing this constant in place would silently invalidate every
// result already reported against it (EXPERIMENT_BRIEF.md §4.6).
//
// WHY THE PROMPT IS SHAPED THE WAY IT IS
// --------------------------------------
// The normalizer is a *reviewer*, not an interviewer. Its failure mode is the
// opposite of the interviewer's: the interviewer fails by under-eliciting, the
// normalizer fails by inventing. Almost every line below exists to make
// inventing harder than leaving something alone -- a closed evidence boundary
// (transcript + ontology, nothing else), an explicit "prefer no change" tie-
// break, and an audit checklist that names the *specific* structural defects
// worth looking for rather than inviting general improvement. "Make this
// ontology better" would produce a bigger, more sophisticated, less grounded
// model; that is the outcome this condition exists to avoid, not to measure.
import crypto from "node:crypto";
import yaml from "js-yaml";

// The output grammar, stated exactly as the app's own domain-model export
// writes it (index.html: buildDomainYamlExport / the apply_ontology_yaml tool
// schema) -- classes and rules and actions as maps, relationships as a list.
// The candidate has to be applicable to the real graph, so it is specified in
// the real grammar rather than the slightly different list-shaped rules/actions
// the B1 baseline prompt used (B1's output is only ever scored, never applied).
const OUTPUT_GRAMMAR = `classes:
  ClassName:
    meaning: "One plain sentence."
    aliases:
      - other term the expert used
    properties:
      propertyName:
        type: text | number | date | boolean
        unit: only if type is number and a unit applies
        allowed:            # only when a fixed value set exists
          - value-one
          - value-two
relationships:
  - name: camelCaseVerbPhrase
    from: ClassName
    to: OtherClassName
    meaning: "One plain sentence."
    aliases:
      - phrasing the expert used
rules:
  ruleName:
    conditions:
      - plain-language condition
actions:
  actionName:
    input: ClassName
    preconditions:
      - ruleName
    effect: what changes
    verification: how to confirm it worked`;

export const POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1 = `ROLE

You are reviewing an ontology that has already been elicited from a domain
expert.

You are NOT interviewing the expert.
You are NOT expanding the domain.
You are NOT adding useful-looking general domain knowledge.

Your evidence consists only of:
- the completed interview transcript;
- the ontology produced from that transcript.

Make the smallest structural corrections justified by that evidence so the
ontology is more reliable for an AI agent.

When evidence is ambiguous, leave the existing representation unchanged.

STRUCTURAL AUDIT

Inspect the ontology for each of the following classes of problem. For each
one, either make a correction that the transcript directly justifies, or leave
the representation alone. Finding nothing in a category is a normal, expected
outcome.

A. Context-dependent properties. Identify properties represented as intrinsic
   attributes even though their value actually depends on another entity, a
   relationship, a context, or a point in time. Where the transcript justifies
   it AND the fact is relevant to an actual competency question or action,
   reify the context through an association concept. Do not introduce
   association classes merely for ontology elegance.

B. Relationship direction. Check whether a relationship's direction materially
   obstructs navigation that an actual question or action needs. Do not create
   duplicate inverse predicates. Change direction only where the operational
   semantics established by the interview justify it.

C. Missing direct operational relationships. Check for facts the expert
   explicitly required that are only represented through an accidental
   multi-hop path, or are missing entirely. Add a direct relationship only if
   the expert's own questions or actions require that connection. Do not
   perform generic graph completion.

D. Duplicated or incorrectly split concepts. Check for duplicate concepts with
   no operational distinction, and for one concept incorrectly combining
   distinctly named things the agent must treat differently. Use transcript
   evidence, not plausibility.

E. Class/property boundary errors. Check whether a class should really be a
   decision-bearing property, and whether a property should be a class because
   the agent must identify, retrieve, connect, compare, or independently reason
   about its instances. Preserve the flat-class profile. Do not introduce
   subclassing.

F. Action-input reachability. For every action, check whether the information
   its input class, preconditions, effect and verification actually need is
   reachable from that input through the modeled graph. Pay particular
   attention to information available only through incoming edges or through
   accidental chains.

G. Unstructured semantic blobs. Look for free-text properties holding
   information the agent is expected to filter, compare, rank, calculate,
   route on, or make decisions from. Normalize such information only where the
   interview clearly establishes a stable structure. Do not atomize narrative
   fields unnecessarily.

H. Unsupported structures. Check classes, relationships, properties, rules and
   actions for traceability to something the expert said the agent must answer
   or do. Remove or restructure only with strong evidence. When uncertain,
   preserve the existing item.

CONSTRAINTS

- Preserve the expert's vocabulary where possible.
- Never introduce external domain knowledge.
- Never invent business requirements.
- Never invent workflows.
- Never add technical fields merely because they are common in databases.
- Preserve useful meanings and aliases.
- Preserve competency and action coverage.
- Preserve rules and actions unless a structural correction requires updating
  their references.
- Keep classes flat. Do not introduce subclassing.
- Use one directed relationship per real-world connection. Never also add its
  inverse.
- Stay inside the ontology grammar given below. Do not invent unsupported
  schema features.
- Prefer no change over a speculative change.

Your objective is the minimum justified structural edit, not maximum ontology
sophistication.

OUTPUT

Return exactly two fenced blocks and nothing else.

First, one complete candidate ontology -- the whole model, not a patch -- in a
\`\`\`yaml block, using exactly this grammar:

${OUTPUT_GRAMMAR}

Every relationship endpoint and every action input must name a class that the
same document declares. Property types must be one of text, number, date or
boolean.

Second, a change manifest in a \`\`\`json block: a JSON array with one object
per conceptual change you made, in this shape:

[
  {
    "changeType": "reify-contextual-property | reverse-relationship-direction | add-missing-direct-relationship | merge-duplicate-concepts | split-conflated-concept | correct-class-property-boundary | repair-action-reachability | structure-decision-blob | remove-unsupported-structure",
    "summary": "one short line",
    "reason": "why the evidence justifies it",
    "agentImpact": "what the agent can now do, or do more reliably",
    "before": "the previous representation, briefly",
    "after": "the new representation, briefly",
    "evidence": "a short quotation or turn reference from the transcript"
  }
]

If you made no changes, return the ontology unchanged and an empty JSON array.
Do not describe your reasoning process anywhere; concise evidence-grounded
explanations in the manifest are sufficient.`;

export const NORMALIZER_PROMPT_VERSION = "v1";

export const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

export const NORMALIZER_PROMPT_SHA256 = sha256(POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1);

export function buildNormalizerUserPrompt(transcript, ontologyYaml) {
  return `Here is the completed interview transcript.

${transcript}

---

Here is the ontology that was produced from that interview.

\`\`\`yaml
${ontologyYaml}
\`\`\`

Review it as instructed and return the candidate ontology and the change manifest.`;
}

// Extraction is deliberately strict about the ontology and lenient about the
// manifest, because they carry different weight. The candidate ontology is the
// measured artifact -- writing prose the scorer would silently misread is the
// exact failure EXPERIMENT_BRIEF.md §7.3 warns about, so a reply without a
// `classes:` block raises. The manifest is a rationale layer for the eventual
// review UI (issue #75 §14); the authoritative record of what changed is the
// deterministic diff (lib/ontologyDiff.mjs), never the model's own account of
// itself, so a missing or malformed manifest is a warning, not a failure.
export function extractCandidateYaml(text) {
  const blocks = [...text.matchAll(/```(?:ya?ml)?\s*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
  const candidate = blocks.find((b) => /^classes\s*:/m.test(b)) || (blocks.length ? null : text.trim());
  if (!candidate || !/^classes\s*:/m.test(candidate)) {
    throw new Error("normalizer reply contains no `classes:` block -- refusing to write a malformed candidate");
  }
  return candidate.endsWith("\n") ? candidate : `${candidate}\n`;
}

export function extractChangeManifest(text) {
  const fenced = [...text.matchAll(/```json\s*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
  for (const block of fenced) {
    try {
      const parsed = JSON.parse(block);
      if (Array.isArray(parsed)) return { manifest: parsed, warning: null };
    } catch (err) { /* try the next json fence */ }
  }
  return { manifest: null, warning: "no parseable JSON array change manifest found in the reply" };
}

const ALLOWED_PROPERTY_TYPES = new Set(["text", "number", "date", "boolean"]);

// Grammar-level validation of a candidate, in the terms the *app* would
// enforce if the candidate were applied (issue #75 §6: "Fail loudly if valid
// ontology YAML cannot be extracted or parsed. Do not silently accept partial
// output.").
//
// `errors` are defects that make the candidate unfit to apply: the app drops an
// edge whose endpoints are not on the canvas, an action whose input class does
// not exist has no meaning, and a precondition naming a rule that was removed
// is a dangling reference -- exactly the "never leave partially-applied graph
// state" hazard issue #80 §14 is about. `warnings` are profile violations that
// still load: subclassing-shaped predicates and reciprocal inverse pairs are
// both outside the MTSR profile the reference model is scored under, and both
// are things the normalizer was explicitly told not to produce, so seeing one
// is a finding about the normalizer rather than a reason to reject the file.
export function validateCandidate(doc) {
  const errors = [];
  const warnings = [];
  if (!doc || typeof doc !== "object") return { errors: ["candidate is not a YAML mapping"], warnings };

  const classes = doc.classes;
  if (!classes || typeof classes !== "object" || Array.isArray(classes)) {
    return { errors: ["candidate has no `classes:` mapping"], warnings };
  }
  const classNames = new Set(Object.keys(classes));

  for (const [className, body] of Object.entries(classes)) {
    if (body === null || body === undefined) continue; // a bare `ClassName:` is legal, just empty
    if (typeof body !== "object" || Array.isArray(body)) {
      errors.push(`class ${className}: body is not a mapping`);
      continue;
    }
    for (const [propName, prop] of Object.entries(body.properties || {})) {
      if (!prop || typeof prop !== "object") {
        errors.push(`class ${className}: property ${propName} is not a mapping`);
        continue;
      }
      if (prop.type !== undefined && !ALLOWED_PROPERTY_TYPES.has(prop.type)) {
        errors.push(`class ${className}: property ${propName} has unsupported type ${JSON.stringify(prop.type)}`);
      }
      if (prop.allowed !== undefined && !Array.isArray(prop.allowed)) {
        errors.push(`class ${className}: property ${propName} has a non-list \`allowed\``);
      }
    }
  }

  const relationships = doc.relationships === undefined ? [] : doc.relationships;
  if (!Array.isArray(relationships)) {
    errors.push("`relationships:` is not a list");
  } else {
    const seen = new Map();
    for (const [i, rel] of relationships.entries()) {
      if (!rel || typeof rel !== "object") { errors.push(`relationship #${i + 1} is not a mapping`); continue; }
      if (!rel.name) errors.push(`relationship #${i + 1} has no name`);
      if (!classNames.has(rel.from)) errors.push(`relationship ${rel.name}: \`from\` names undeclared class ${JSON.stringify(rel.from)}`);
      if (!classNames.has(rel.to)) errors.push(`relationship ${rel.name}: \`to\` names undeclared class ${JSON.stringify(rel.to)}`);
      if (/^(is|are)?\s*(a|an|kind of|type of|classified as|subclass of|instance of)$/i.test(String(rel.name).replace(/([a-z])([A-Z])/g, "$1 $2").trim())) {
        warnings.push(`relationship ${rel.name} (${rel.from} -> ${rel.to}) is subclassing-shaped, which the profile excludes`);
      }
      const forward = `${rel.from} ${rel.to}`;
      const backward = `${rel.to} ${rel.from}`;
      if (seen.has(backward)) warnings.push(`relationship ${rel.name} (${rel.from} -> ${rel.to}) may be an inverse of ${seen.get(backward)}`);
      if (!seen.has(forward)) seen.set(forward, `${rel.name} (${rel.from} -> ${rel.to})`);
    }
  }

  const ruleNames = new Set(Object.keys(doc.rules || {}));
  for (const [actionName, action] of Object.entries(doc.actions || {})) {
    if (!action || typeof action !== "object") { errors.push(`action ${actionName} is not a mapping`); continue; }
    if (action.input !== undefined && action.input !== null && !classNames.has(action.input)) {
      errors.push(`action ${actionName}: \`input\` names undeclared class ${JSON.stringify(action.input)}`);
    }
    for (const pre of action.preconditions || []) {
      if (!ruleNames.has(pre)) errors.push(`action ${actionName}: precondition ${JSON.stringify(pre)} names no declared rule`);
    }
  }

  return { errors, warnings };
}

export function parseCandidate(yamlText) {
  let doc;
  try {
    doc = yaml.load(yamlText);
  } catch (err) {
    throw new Error(`candidate YAML does not parse: ${err.message}`);
  }
  return doc;
}
