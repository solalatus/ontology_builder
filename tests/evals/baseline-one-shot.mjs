// ONE-SHOT TRANSCRIPT -> MTSR BASELINE (condition B1)
//
//   OPENAI_API_KEY=sk-... node tests/evals/baseline-one-shot.mjs run-01 run-02 run-03
//
// WHAT THIS IS FOR
// ----------------
// The eval measures what the *interactive* elicitation agent recovered: it
// interviewed the persona turn by turn, deciding what to ask next and
// committing each confirmed step into the live model as it went. An obvious
// reviewer question is whether that interactivity earns its keep -- would a
// single pass over the finished transcript have produced just as good a
// model? This script builds exactly that comparison condition: one model
// call, the complete conversation as input, the same MTSR export grammar as
// output, scored afterwards by the same scorer against the same fixture.
//
// It is a *post hoc* baseline, and deliberately a generous one to the
// baseline side: it reads the transcript the interactive agent itself
// produced, so it inherits the benefit of that agent's questioning without
// paying for it. If the one-shot pass matches or beats the interactive
// agent, the interactive machinery is not earning its complexity on this
// fixture. If it falls short, the difference is attributable to the
// incremental, tool-committing loop rather than to what was said.
//
// WHAT IT IS NOT
// --------------
// Not a "generic interviewer" baseline (that needs a fresh interview -- see
// baseline-b2-generic-interviewer.eval.spec.mjs). Not evidence about unseen
// domains. It varies exactly one factor -- how the transcript is turned into
// a model -- and holds the conversation itself fixed.
//
// COST: one chat-completion call per run. No interview is repeated, the
// persona is never invoked, and nothing under results/runs/ is modified
// (EXPERIMENT_BRIEF.md §4.1 -- read-only access to that directory only).
//
// OUTPUT: tests/evals/results/baselines/b1-one-shot/<run-id>/
//   recovered-model.yaml   the one-shot model, in the same grammar as a real run
//   baseline-provenance.json  model id, params, prompt hash, transcript hash, usage
//   raw-response.md        the model's untouched reply, for audit
//
// Score them afterwards with the normal offline tooling:
//   node tests/evals/score-baseline.mjs b1-one-shot run-01 run-02 run-03
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError,
} from "../lib/liveOpenAi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");
// Condition-labeled subdirectory, not a flat results/baselines/<run-id>/ --
// keeps this condition's output from colliding with B2/B3's own subdirectories
// under the same results/baselines/ root (EXPERIMENT_BRIEF.md §4.1).
const OUT_DIR = path.join(__dirname, "results", "baselines", "b1-one-shot");
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

// Same model the interactive interviewer used, so the comparison isolates the
// procedure (one-shot vs. incremental) rather than model capability.
const MODEL = process.env.BASELINE_MODEL || "gpt-5.5-2026-04-23";

// The output grammar, stated exactly as the app's own export writes it, so the
// baseline model is scored on domain content rather than on guessing a format.
// Deliberately NOT the fixture and NOT the interviewer's interview strategy --
// the baseline must not receive information the interactive agent had to earn
// through questioning (EXPERIMENT_BRIEF.md §4.2).
export const SYSTEM_PROMPT = `You build a compact, agent-facing domain model from an interview transcript.

You will receive the complete transcript of an interview with a domain expert. Read all of it, then output ONE YAML document capturing the domain the expert described.

Output grammar (use exactly this shape):

\`\`\`yaml
classes:
  ClassName:
    meaning: "One plain sentence describing what this is."
    aliases:
      - other term the expert used
    properties:
      propertyName:
        type: text | number | date | boolean
        allowed:          # only for controlled value sets
          - value-one
          - value-two
relationships:
  - name: verbPhrase
    from: ClassName
    to: OtherClassName
    meaning: "One plain sentence describing the connection."
    aliases:
      - phrasing the expert used
rules:
  - name: ruleName
    conditions:
      - plain-language condition
actions:
  - name: actionName
    input: ClassName
    preconditions:
      - plain-language precondition
    effect: what changes
    verification: how to confirm it worked
\`\`\`

Rules:
- Model ONLY what the expert actually stated in the transcript. Do not add domain knowledge from elsewhere, and do not invent plausible-sounding detail the expert never mentioned.
- Use the expert's own vocabulary for names and aliases.
- This model has flat classes and directed relationship edges. There is no subclassing: if the expert described a specialisation, express it as a relationship instead.
- Include a property only when it is decision-relevant: something the expert described filtering, comparing, deciding, or acting on. Skip purely technical identifier or record-keeping fields.
- Represent each real-world connection as exactly ONE relationship edge. Do not also add its inverse.
- Output the YAML document and nothing else: no commentary, no explanation, no markdown fence.`;

export function extractYaml(text) {
  // Accept a bare document or one wrapped in a fence, and fail loudly rather
  // than silently persisting prose that the scorer would then misread.
  const fenced = text.match(/```(?:yaml)?\s*\n([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  if (!/^classes\s*:/m.test(body)) {
    throw new Error("model reply contains no `classes:` block -- refusing to write a malformed baseline");
  }
  return body + "\n";
}

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// Only runs the live-call loop when invoked as a script (`node
// baseline-one-shot.mjs ...`), not when imported (tests/one-to-one-scoring.spec.mjs
// imports extractYaml for the offline extraction acceptance check without
// wanting to trigger this loop or require an API key).
if (import.meta.url === `file://${process.argv[1]}`) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set. This script makes one real API call per run.");
    process.exit(1);
  }
  const runIds = process.argv.slice(2);
  if (!runIds.length) {
    console.error("Usage: OPENAI_API_KEY=... node tests/evals/baseline-one-shot.mjs <run-id> [...]");
    process.exit(1);
  }

  for (const runId of runIds) {
    const transcriptPath = path.join(RUNS_DIR, runId, "conversation-log.md");
    if (!fs.existsSync(transcriptPath)) {
      console.error(`${runId}: no conversation-log.md found, skipping`);
      continue;
    }
    const transcript = fs.readFileSync(transcriptPath, "utf8");
    const userPrompt = `Here is the complete interview transcript.\n\n${transcript}`;

    let res, data;
    for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
      res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        // Deliberately no `temperature` -- confirmed live (HTTP 400,
        // "Unsupported value: 'temperature' does not support 0 with this
        // model. Only the default (1) value is supported.") that the
        // interviewer model is reasoning-tier and rejects a non-default
        // temperature outright, same class of incompatibility this codebase
        // already hit once with `max_tokens` (index.html's callAgentChatRaw,
        // conversationOrchestrator.mjs's appearsFinished -- neither sets it
        // either, for the same reason). Omitting it is the one request shape
        // confirmed to work across standard and reasoning-tier models alike.
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
      data = await res.json();
      if (res.ok) break;
      if (res.status === 429 && attempt < RATE_LIMIT_MAX_ATTEMPTS && !isInsufficientQuotaError(data)) {
        await sleepMs(rateLimitBackoffMs(attempt));
        continue;
      }
      throw new Error(`${runId}: baseline call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
    }

    const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    const yamlText = extractYaml(reply);

    const outDir = path.join(OUT_DIR, runId);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "recovered-model.yaml"), yamlText);
    fs.writeFileSync(path.join(outDir, "raw-response.md"), reply);
    fs.writeFileSync(path.join(outDir, "baseline-provenance.json"), JSON.stringify({
      schemaVersion: 1,
      condition: "one-shot-transcript-to-mtsr",
      runId,
      generatedAt: new Date().toISOString(),
      model: MODEL,
      temperature: null, // not sent -- see the request-body comment above; this model only accepts its default
      systemPromptSha256: sha256(SYSTEM_PROMPT),
      transcriptSha256: sha256(transcript),
      transcriptPath: `tests/evals/results/runs/${runId}/conversation-log.md`,
      usage: data.usage || null,
      note: "Single chat-completion call over the finished transcript of the interactive run. "
        + "The persona was not re-invoked and no interactive run artifact was modified. "
        + "The baseline sees the transcript the interactive agent produced, so it is a generous "
        + "comparison condition for the baseline side.",
    }, null, 2));

    const classes = (yamlText.match(/^ {2}\S+:/gm) || []).length;
    const rels = (yamlText.match(/^ {2}- name:/gm) || []).length;
    console.log(`${runId}: wrote baseline model (~${classes} class entries, ~${rels} relationship/action entries) -> ${path.relative(process.cwd(), outDir)}`);
  }

  console.log("\nDone. Score with:  node tests/evals/score-baseline.mjs b1-one-shot " + runIds.join(" "));
}
