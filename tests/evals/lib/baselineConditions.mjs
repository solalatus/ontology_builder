// THE BASELINE CONDITIONS (EXPERIMENT_BRIEF.md §3), shared by the old
// itops-only harnesses and the multi-domain runner
//
// B2 (generic interviewer) and B3 (no commits mid-conversation) are
// conditions of run-multi-domain-benchmark.mjs (ONTOLOGY_EVAL_CONDITION);
// B1 (one-shot extraction over a finished transcript) is
// run-baseline-b1.mjs. All three were first run on itops alone
// (tests/evals/results/baselines/). Their prompts are the pre-registered
// originals and must not change (§4.6: a baseline prompt edited after
// seeing a score is a second treatment): B2's text was moved here verbatim
// from baseline-b2-generic-interviewer.eval.spec.mjs, and B1/B3's
// extraction prompt is baseline-one-shot.mjs's SYSTEM_PROMPT, imported, not
// copied. tests/baseline-conditions.spec.mjs pins both hashes to the ones
// the original runs recorded.
import crypto from "node:crypto";
import { SYSTEM_PROMPT as EXTRACTION_SYSTEM_PROMPT, extractYaml } from "../baseline-one-shot.mjs";

export { EXTRACTION_SYSTEM_PROMPT, extractYaml };

// Deliberately short and generic ("interview this expert and build a domain
// model" -- the brief's own example), procedural profile-constraints
// paragraph included (structural, not domain-specific), zero fixture
// content, zero staged-interview technique.
export const GENERIC_SYSTEM_PROMPT = `Interview this domain expert and build a compact domain model of what they describe.

Ask questions, confirm what you've understood, and use the apply_ontology_yaml tool to add or update classes, relationships, rules, and actions in the model as you go -- call it whenever you've confirmed something new or changed, not only once at the end. Use the get_graph_state tool if you need to check the model's current state.

The model has flat classes and directed relationship edges: there is no subclassing (express a specialization as a relationship instead), and each real-world connection should be exactly one directed edge, never also its inverse. Include a property only when it is decision-relevant -- something the expert would filter, compare, or act on -- not a purely technical identifier or record-keeping field. Use the expert's own vocabulary for class, relationship, and property names and aliases.

Use this YAML shape when calling apply_ontology_yaml:

classes:
  ClassName:
    meaning: <one sentence, or omit>
    aliases: [alt name, ...]
    properties:
      propName:
        type: text | number | date | boolean
        unit: <only if type is number and a unit applies>
        allowed: [choice1, choice2, ...]   # only if a fixed list exists

relationships:
  - name: camelCaseVerbPhrase
    from: ClassA
    to: ClassB
    meaning: <one sentence, or omit>
    aliases: [alt phrasing, ...]

rules:
  ruleName:
    conditions:
      - <plain-language condition>

actions:
  actionName:
    input: ClassName
    preconditions: [ruleName, ...]

When you believe the interview has covered what the expert needs, say so clearly.`;

export const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

// The hashes the original itops runs recorded in baseline-provenance.json.
export const ORIGINAL_PROMPT_SHA256 = {
  generic: "1ab4027eb219fcc2befe1b782d5e214335daa4e7c648721cd6fe9ed88c5a5d8f",
  extraction: "41c2e221409507e489f9cab3bced39ec940a523ce85ef94b767eed8bc7202de9",
};

export const CONDITIONS = ["b2-generic-interviewer", "b3-no-commit"];

/**
 * B1's and B3's one extraction call: the finished transcript in, one MTSR
 * YAML document out, through the caller's `chat(messages, model, extraBody)`
 * (so its tokens are counted with the run's). The user message is the
 * original's, byte for byte. Throws if the reply holds no `classes:` block
 * (extractYaml), rather than scoring prose.
 */
export async function extractModelFromTranscript({ transcript, chat, model, extraBody = {} }) {
  const messages = [
    { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
    { role: "user", content: `Here is the complete interview transcript.\n\n${transcript}` },
  ];
  const { text, usage, finishReason } = await chat(messages, model, extraBody);
  const yamlText = extractYaml(text || "");
  return {
    reply: text, yamlText, usage: usage || null, finishReason: finishReason || null,
    provenance: {
      model, extraBody,
      extractionSystemPromptSha256: sha256(EXTRACTION_SYSTEM_PROMPT),
      transcriptSha256: sha256(transcript),
      usage: usage || null, finishReason: finishReason || null,
    },
  };
}
