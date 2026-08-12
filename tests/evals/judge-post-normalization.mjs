// TRANSCRIPT-GROUNDED, BLIND STRUCTURAL A/B JUDGE (issue #75 §9)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/judge-post-normalization.mjs run-01 run-02 run-03
//
// WHY THIS EXISTS
// ---------------
// The ground-truth recovery scorer is necessary but not sufficient for this
// condition. It measures agreement with a hidden reference model that has its
// own modelling conventions -- flat classes, one directed edge per connection,
// reciprocal pairs collapsed. A *correct* structural normalization can move
// away from those conventions: reifying a context-dependent property into an
// association concept is exactly the kind of edit issue #75 asks for, and it
// scores as a lost property plus two unmatched relationships against a fixture
// that models the same fact flatly. Scoring alone therefore cannot distinguish
// "made the model worse" from "made the model differently-shaped than gold".
//
// This is the second evaluation: does a strong reader, given ONLY the original
// interview transcript as evidence, prefer the normalized ontology or the
// original one for agent use?
//
// BLINDING AND BIAS CONTROL
// -------------------------
// 1. The judge is never told which model is normalized, and never sees the
//    normalizer's prompt, the fixture, or any scores.
// 2. Which ontology is presented as "Model A" is decided by a deterministic
//    hash of (runId, judge model, salt) -- reproducible, and recorded in every
//    artifact, so the assignment can be checked rather than trusted.
// 3. Every pair is judged TWICE, in both orderings. A judge whose preference
//    follows the position rather than the content shows up as a flip, and the
//    flip rate is reported. Order bias is measured, not assumed absent.
// 4. Two independent judge models are used, neither of which is the normalizer
//    model. A single judge sharing a model with the normalizer would make
//    self-preference indistinguishable from a real quality difference; two
//    different judges also give an inter-judge agreement rate, which is the
//    only available read on how noisy this endpoint is at n=3.
//
// COST: (runs x 2 orderings x judges) calls -- 12 for three runs and two
// judges. Nothing under results/runs/ is written to.
//
// OUTPUT: results/baselines/post-normalization-v1/judge/
//   judgments.json                   every verdict, with its blinding key and provenance
//   raw/<judge>-<run>-<order>.md     each judge reply untouched, for audit
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha256 } from "./lib/normalizerPromptV1.mjs";
import { chatOnce, resolveClientConfig, sumUsage } from "./lib/chatClient.mjs";
import { CONDITION } from "./post-normalization.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");
const COND_DIR = path.join(__dirname, "results", "baselines", CONDITION);
const JUDGE_DIR = path.join(COND_DIR, "judge");

// Neither of these is the normalizer's model (gpt-5.4). Fixed here rather than
// chosen at run time so the condition is reproducible from the file alone.
export const DEFAULT_JUDGE_MODELS = ["gpt-5.6-sol", "gpt-5.1"];

// Fixed, published salt. The blinding has to be *reproducible* -- a reader
// re-deriving the assignment must get the same answer -- while still not being
// a constant "normalized is always B" that a judge could learn within a batch.
export const BLINDING_SALT = "post-normalization-v1/blind-order";

// Deterministic A/B assignment. Even first byte -> the ORIGINAL ontology is
// Model A; odd -> the CANDIDATE is Model A.
export function blindingFor(runId, judgeModel) {
  const key = sha256(`${BLINDING_SALT}|${runId}|${judgeModel}`);
  const originalIsA = parseInt(key.slice(0, 2), 16) % 2 === 0;
  return { key, originalIsA };
}

export const JUDGE_SYSTEM_PROMPT = `You are a strict knowledge-engineering reviewer.

You will be given the complete transcript of an interview with a domain expert, and TWO candidate domain models built to describe that same domain, labelled Model A and Model B. Both are written in the same YAML grammar: flat classes with properties, directed relationships, named rules, and actions.

Your job is to decide which model is more suitable as a shared domain representation for an AI agent working in this domain.

EVIDENCE BOUNDARY
The interview transcript is your only evidence. Judge each model against what the expert actually said. Content that is plausible, conventional, or professionally sensible but NOT established by the transcript is an unsupported addition, and counts against the model that contains it. You have no other source of truth about this domain, and there is no reference answer to recover.

WHAT TO ASSESS
1. Evidence fidelity: is everything in the model traceable to the transcript?
2. Absence of invented domain knowledge: content the expert never established.
3. Competency and action coverage: can the questions and actions the expert said the agent must handle still be answered/performed?
4. Contextual fact placement: are facts whose value depends on another entity, a relationship, or a point in time placed where they actually belong, rather than flattened into an intrinsic attribute?
5. Action-input reachability: from each action's input class, is the information its preconditions, effect and verification need actually reachable through the modeled relationships?
6. Missing direct operational relationships: facts the expert required that exist only as an accidental multi-hop path, or not at all.
7. Class/property boundary quality: things the agent must identify, retrieve, connect or compare should be classes; decision values should be properties.
8. Duplication and over-splitting: duplicate concepts with no operational difference, or one concept conflating things the agent must treat differently.
9. Decision-relevant information hidden in free-text blobs the agent would have to parse.
10. Rule and action coherence: do rules reference values and fields the model actually has, and do action effects and verifications line up with what the model can represent?
11. Overall suitability for an agent.

HOW TO WEIGH
Bigger is not better. A model that is larger, more detailed, or more sophisticated is worse, not better, if the extra content is not established by the transcript. A model that is smaller is worse if it has dropped something the expert said the agent needs. Structural correctness that the transcript supports outweighs surface polish in either direction. If the two models are close enough that you would not act on the difference, answer "tie" -- that is a real answer, not a failure to decide.

You are not told how either model was produced. Do not speculate about it, and do not let the order in which they are presented influence you.

OUTPUT
Return exactly one \`\`\`json block and nothing else, in this shape:

{
  "preferred": "A" | "B" | "tie",
  "confidence": "low" | "medium" | "high",
  "material_regressions_A": ["..."],
  "material_regressions_B": ["..."],
  "unsupported_additions_A": ["..."],
  "unsupported_additions_B": ["..."],
  "competency_coverage_loss_A": ["..."],
  "competency_coverage_loss_B": ["..."],
  "short_reason": "at most three sentences"
}

A "material regression" is a structural defect serious enough that the agent would answer a question wrongly or fail an action because of it. Use empty arrays when there is nothing to report; do not pad them. Keep each list entry to one line.`;

export function buildJudgeUserPrompt(transcript, modelAYaml, modelBYaml) {
  return `INTERVIEW TRANSCRIPT

${transcript}

---

MODEL A

\`\`\`yaml
${modelAYaml}
\`\`\`

---

MODEL B

\`\`\`yaml
${modelBYaml}
\`\`\`

Assess both models against the transcript and return your verdict as the single JSON block described in your instructions.`;
}

export function parseJudgeVerdict(text) {
  const blocks = [...text.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
  const candidates = blocks.length ? blocks : [text.trim()];
  for (const block of candidates) {
    try {
      const parsed = JSON.parse(block);
      if (parsed && typeof parsed === "object" && ["A", "B", "tie"].includes(parsed.preferred)) return parsed;
    } catch (err) { /* try the next block */ }
  }
  throw new Error("judge reply contained no parseable verdict object with a valid `preferred` field");
}

// Translates a positional verdict into the thing actually under test, using the
// blinding record. This is the only place the mapping happens, so a mislabeled
// verdict cannot leak into the analysis.
export function resolveVerdict(verdict, { originalIsA }) {
  const map = { A: originalIsA ? "original" : "normalized", B: originalIsA ? "normalized" : "original" };
  const bySubject = {};
  for (const field of ["material_regressions", "unsupported_additions", "competency_coverage_loss"]) {
    bySubject[`${field}_original`] = verdict[`${field}_${originalIsA ? "A" : "B"}`] || [];
    bySubject[`${field}_normalized`] = verdict[`${field}_${originalIsA ? "B" : "A"}`] || [];
  }
  return {
    preferred: verdict.preferred === "tie" ? "tie" : map[verdict.preferred],
    preferredPosition: verdict.preferred,
    confidence: verdict.confidence || null,
    shortReason: verdict.short_reason || "",
    ...bySubject,
    sideCheck: { A: map.A, B: map.B }, // written into every artifact so the un-blinding can be re-derived, not trusted
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runIds = process.argv.slice(2);
  if (!runIds.length) {
    console.error("Usage: node tests/evals/judge-post-normalization.mjs <run-id> [...]");
    process.exit(1);
  }
  const config = resolveClientConfig();
  const judgeModels = (process.env.JUDGE_MODELS || DEFAULT_JUDGE_MODELS.join(",")).split(",").map((s) => s.trim()).filter(Boolean);

  fs.mkdirSync(path.join(JUDGE_DIR, "raw"), { recursive: true });
  console.log(`Blind structural A/B judge · judges: ${judgeModels.join(", ")} · ${runIds.length} runs x 2 orderings\n`);

  const judgments = [];
  const usages = [];

  for (const runId of runIds) {
    const transcript = fs.readFileSync(path.join(RUNS_DIR, runId, "conversation-log.md"), "utf8");
    const originalYaml = fs.readFileSync(path.join(RUNS_DIR, runId, "recovered-model.yaml"), "utf8");
    const candidatePath = path.join(COND_DIR, runId, "recovered-model.yaml");
    if (!fs.existsSync(candidatePath)) {
      console.error(`${runId}: no candidate at ${path.relative(process.cwd(), candidatePath)} -- run post-normalization.mjs first`);
      continue;
    }
    const candidateYaml = fs.readFileSync(candidatePath, "utf8");

    for (const judgeModel of judgeModels) {
      const blinding = blindingFor(runId, judgeModel);
      for (const order of ["primary", "reversed"]) {
        // `primary` uses the hashed assignment; `reversed` swaps the two
        // positions and nothing else, so any preference that follows position
        // rather than content shows up as a disagreement between the two.
        const originalIsA = order === "primary" ? blinding.originalIsA : !blinding.originalIsA;
        const modelA = originalIsA ? originalYaml : candidateYaml;
        const modelB = originalIsA ? candidateYaml : originalYaml;

        const call = await chatOnce({
          config, model: judgeModel,
          systemPrompt: JUDGE_SYSTEM_PROMPT,
          userPrompt: buildJudgeUserPrompt(transcript, modelA, modelB),
          label: `${runId}/${judgeModel}/${order} judge`,
        });
        usages.push(call.usage);
        fs.writeFileSync(path.join(JUDGE_DIR, "raw", `${judgeModel}-${runId}-${order}.md`), call.reply);

        const verdict = parseJudgeVerdict(call.reply);
        const resolved = resolveVerdict(verdict, { originalIsA });
        judgments.push({
          runId, judgeModel, order,
          blindingKey: blinding.key,
          originalPresentedAs: originalIsA ? "A" : "B",
          ...resolved,
          modelReported: call.modelReported,
          usage: call.usage,
        });
        console.log(`${runId} · ${judgeModel} · ${order.padEnd(8)} · original=${originalIsA ? "A" : "B"} · prefers ${resolved.preferred} (${resolved.confidence})`);
      }
    }
  }

  fs.writeFileSync(path.join(JUDGE_DIR, "judgments.json"), `${JSON.stringify({
    schemaVersion: 1,
    condition: CONDITION,
    generatedAt: new Date().toISOString(),
    judgePromptSha256: sha256(JUDGE_SYSTEM_PROMPT),
    blindingSalt: BLINDING_SALT,
    judgeModels,
    provider: config.provider,
    note: "Blind transcript-grounded A/B comparison of the interactive run's ontology against the "
      + "post-normalization-v1 candidate. The judge never saw the fixture, the normalizer prompt, any "
      + "score, or which model was which. Every pair was judged in both orderings by two judge models, "
      + "neither of which is the normalizer's model.",
    usageTotal: sumUsage(usages),
    judgments,
  }, null, 2)}\n`);

  console.log(`\nWrote ${judgments.length} verdicts -> ${path.relative(process.cwd(), path.join(JUDGE_DIR, "judgments.json"))}`);
  console.log(`Analyse with:  node tests/evals/analyze-post-normalization.mjs ${runIds.join(" ")}`);
}
