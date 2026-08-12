// POST-INTERVIEW STRUCTURAL NORMALIZATION -- conditions `post-normalization-v1`/`-v2`
//
//   AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com \
//   AZURE_OPENAI_API_KEY=... \
//   node tests/evals/post-normalization.mjs run-01 run-02 run-03
//
//   # v2 (v1 plus exactly two constraints -- see lib/normalizerPromptV2.mjs):
//   node tests/evals/post-normalization.mjs --condition=post-normalization-v2 run-01 run-02 run-03
//
//   # or, against OpenAI directly:
//   OPENAI_API_KEY=sk-... EVAL_PROVIDER=openai NORMALIZER_MODEL=gpt-5.5-2026-04-23 \
//   node tests/evals/post-normalization.mjs run-01 run-02 run-03
//
// The prompt each condition runs comes from lib/conditions.mjs; everything else
// in this file is version-agnostic, so v1's numbers stay reproducible by the
// same script that produces v2's.
//
// WHAT THIS IS FOR (issue #75)
// ----------------------------
// The eval program has already shown that the concept-structure gap -- classes
// recovered far more reliably than relationships and properties -- survives
// every condition tried so far: one-shot extraction (B1), a generic interviewer
// (B2), and an interview that can never commit (B3). Whatever produces it, it
// is not the tool-calling loop. This condition attacks it from the only angle
// none of those did: leave the interview completely alone and ask whether a
// dedicated structural review pass over the *finished* artifact makes the
// ontology more reliable for an agent.
//
// The single factor varied is therefore: **whether a finished ontology gets a
// dedicated structural review pass before it is used.** Held fixed: the
// interview itself (the frozen anchor transcripts are read, never re-run), the
// persona, the fixture, the scorer, both denominators, and the production
// interviewer, which is not touched at all -- guarded by
// tests/agent-production-invariants.spec.mjs.
//
// EVIDENCE BOUNDARY. The normalizer receives the finished transcript and the
// ontology produced from it. Nothing else. It never sees the fixture
// (EXPERIMENT_BRIEF.md §4.2), and it is not given the interviewer's prompt,
// the scorer, or any ground truth about what "should" have been recovered.
//
// COST: exactly one model call per run. No interview is repeated, the persona
// is never invoked, and nothing under results/runs/ is written to -- this
// script opens that directory read-only and records a SHA-256 of everything it
// read so a later reader can prove it (EXPERIMENT_BRIEF.md §4.1).
//
// OUTPUT: tests/evals/results/baselines/post-normalization-v1/<run-id>/
//   recovered-model.yaml       the candidate ontology, in the app's own grammar
//   raw-response.md            the model's untouched reply, for audit
//   change-manifest.json       the model's own account of what it changed (§14)
//   normalization-diff.json    the DETERMINISTIC diff -- the authoritative record
//   normalization-diff.md      the same diff, human-readable
//   baseline-provenance.json   models, request params, prompt/source hashes, usage
//
// The file is named `recovered-model.yaml` deliberately, so that
// score-baseline.mjs, cross-run-analyses.mjs and threshold-sensitivity.mjs all
// read this condition with no changes to their loading path (§5's output
// contract). "Recovered" is the shared contract's word, not a claim that this
// condition recovered anything by itself: it starts from the interactive run's
// own model.
//
// Score it afterwards with the normal offline tooling:
//   node tests/evals/score-baseline.mjs post-normalization-v1 run-01 run-02 run-03
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildNormalizerUserPrompt, extractCandidateYaml, extractChangeManifest, parseCandidate,
  validateCandidate, sha256,
} from "./lib/normalizerPromptV1.mjs";
import { parseConditionArgs, DEFAULT_CONDITION, DEFAULT_NORMALIZER_MODEL } from "./lib/conditions.mjs";
import { computeOntologyDiff, formatOntologyDiffMarkdown, summarizeOntologyDiff, isOntologyDiffEmpty } from "./lib/ontologyDiff.mjs";
import { chatOnce, resolveClientConfig } from "./lib/chatClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "results", "runs");
export const CONDITION = DEFAULT_CONDITION; // re-exported for callers that only ever meant "the first one"
export const conditionOutputDir = (name) => path.join(__dirname, "results", "baselines", name);
export { DEFAULT_NORMALIZER_MODEL };

export function readSourceArtifacts(runId) {
  const transcriptPath = path.join(RUNS_DIR, runId, "conversation-log.md");
  const ontologyPath = path.join(RUNS_DIR, runId, "recovered-model.yaml");
  if (!fs.existsSync(transcriptPath)) throw new Error(`${runId}: no conversation-log.md at ${transcriptPath}`);
  if (!fs.existsSync(ontologyPath)) throw new Error(`${runId}: no recovered-model.yaml at ${ontologyPath}`);
  const transcript = fs.readFileSync(transcriptPath, "utf8");
  const ontologyYaml = fs.readFileSync(ontologyPath, "utf8");
  return {
    transcript, ontologyYaml,
    transcriptSha256: sha256(transcript),
    ontologySha256: sha256(ontologyYaml),
    transcriptPath: `tests/evals/results/runs/${runId}/conversation-log.md`,
    ontologyPath: `tests/evals/results/runs/${runId}/recovered-model.yaml`,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { condition, runIds } = parseConditionArgs(process.argv.slice(2));
  if (!runIds.length) {
    console.error("Usage: node tests/evals/post-normalization.mjs [--condition=post-normalization-v1|v2] <run-id> [...]");
    console.error("Example: node tests/evals/post-normalization.mjs --condition=post-normalization-v2 run-01 run-02 run-03");
    process.exit(1);
  }
  const OUT_DIR = conditionOutputDir(condition.name);

  const config = resolveClientConfig();
  const model = process.env.NORMALIZER_MODEL || condition.defaultModel;
  console.log(`Condition ${condition.name} · normalizer prompt ${condition.promptVersion} (${condition.promptSha256.slice(0, 12)}…)`);
  console.log(`Provider ${config.provider} · model/deployment ${model} · one call per run\n`);

  const frozenInputs = {};
  let hardFailures = 0;

  for (const runId of runIds) {
    const src = readSourceArtifacts(runId);
    frozenInputs[runId] = {
      transcriptPath: src.transcriptPath, transcriptSha256: src.transcriptSha256,
      ontologyPath: src.ontologyPath, ontologySha256: src.ontologySha256,
    };

    const started = Date.now();
    const call = await chatOnce({
      config, model,
      systemPrompt: condition.systemPrompt,
      userPrompt: buildNormalizerUserPrompt(src.transcript, src.ontologyYaml),
      label: `${runId} normalizer`,
    });

    // Fail loudly rather than persist something the scorer would misread
    // (issue #75 §6, EXPERIMENT_BRIEF.md §7.3). The raw reply is written first
    // so a failure is still auditable afterwards.
    const outDir = path.join(OUT_DIR, runId);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "raw-response.md"), call.reply);

    const candidateYaml = extractCandidateYaml(call.reply);
    const candidateDoc = parseCandidate(candidateYaml);
    const sourceDoc = parseCandidate(src.ontologyYaml);
    const validation = validateCandidate(candidateDoc);
    const { manifest, warning: manifestWarning } = extractChangeManifest(call.reply);

    const diff = computeOntologyDiff(sourceDoc, candidateDoc);
    const diffSummary = summarizeOntologyDiff(diff);

    fs.writeFileSync(path.join(outDir, "recovered-model.yaml"), candidateYaml);
    fs.writeFileSync(path.join(outDir, "normalization-diff.json"), `${JSON.stringify(diff, null, 2)}\n`);
    fs.writeFileSync(path.join(outDir, "normalization-diff.md"), formatOntologyDiffMarkdown(diff, {
      title: `Semantic diff -- ${runId}: interactive ontology vs. ${condition.name} candidate`,
    }));
    fs.writeFileSync(path.join(outDir, "change-manifest.json"), `${JSON.stringify(manifest === null ? [] : manifest, null, 2)}\n`);

    fs.writeFileSync(path.join(outDir, "baseline-provenance.json"), `${JSON.stringify({
      schemaVersion: 1,
      condition: condition.name,
      runId,
      generatedAt: new Date().toISOString(),
      wallClockMs: Date.now() - started,
      model,
      modelReported: call.modelReported,
      finishReason: call.finishReason,
      requestParams: call.requestParams,
      normalizerPromptVersion: condition.promptVersion,
      normalizerPromptSha256: condition.promptSha256,
      sourceTranscriptPath: src.transcriptPath,
      sourceTranscriptSha256: src.transcriptSha256,
      sourceOntologyPath: src.ontologyPath,
      sourceOntologySha256: src.ontologySha256,
      candidateSha256: sha256(candidateYaml),
      usage: call.usage,
      validation,
      changeManifestEntries: manifest === null ? null : manifest.length,
      changeManifestWarning: manifestWarning,
      diffSummary,
      note: "One chat-completion call over the frozen interactive run's transcript and its own produced "
        + "ontology. The interview was not re-run, the persona was not invoked, the fixture was never shown "
        + "to the normalizer, and nothing under results/runs/ was modified. The deterministic diff in "
        + "normalization-diff.json is the authoritative record of what changed; change-manifest.json is the "
        + "model's own account of it and is not trusted as evidence of what it actually did.",
    }, null, 2)}\n`);

    const status = validation.errors.length ? `${validation.errors.length} VALIDATION ERROR(S)` : "valid";
    console.log(`${runId}: ${diffSummary.totalChanges} semantic changes · ${status}`
      + `${validation.warnings.length ? ` · ${validation.warnings.length} warning(s)` : ""}`
      + `${manifestWarning ? " · manifest missing" : ` · ${manifest.length} manifest entries`}`
      + ` · ${call.usage ? call.usage.total_tokens : "?"} tokens`);
    if (isOntologyDiffEmpty(diff)) console.log(`  (no semantic change at all -- the normalizer returned the ontology as-is)`);
    for (const e of validation.errors) { console.log(`  ERROR   ${e}`); hardFailures += 1; }
    for (const w of validation.warnings) console.log(`  warning ${w}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "frozen-inputs.sha256.json"), `${JSON.stringify({
    note: "SHA-256 of every frozen anchor artifact this condition read. tests/post-normalization.spec.mjs "
      + "re-computes these, so a later modification of a frozen input fails the default test suite "
      + "(EXPERIMENT_BRIEF.md §4.1).",
    inputs: frozenInputs,
  }, null, 2)}\n`);

  console.log(`\nDone. Score with:  node tests/evals/score-baseline.mjs ${condition.name} ${runIds.join(" ")}`);
  if (hardFailures) {
    console.error(`\n${hardFailures} validation error(s) across the candidates -- see baseline-provenance.json per run.`);
    process.exit(2);
  }
}
