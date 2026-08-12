// PREFLIGHT FOR THE issue #85 BATCH — exercise everything, spend almost nothing
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/self-correction-preflight.mjs
//
// Six interviews cost real money and take hours, and the batch has already
// aborted twice on setup bugs that a two-turn run would have caught in a
// minute: a mis-derived control prompt, and Node-side harness calls still
// pointed at api.openai.com. Neither was a defect in the experiment. Both were
// plumbing, and plumbing is exactly what a preflight is for.
//
// This drives the REAL runner, both arms, with the turn cap set to 2. Every
// moving part is touched: the Azure connection and model pinning, the app
// relay, the persona, the completion classifier, the control arm's prompt
// reconstruction, the treatment arm's findings feed, checkpointing, and the
// artifact shape. It writes to a throwaway directory and deletes it, so it can
// never be mistaken for a result.
//
// Cost: roughly a dozen small calls. Run it before every batch, not once.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { chatOnce, DEFAULT_AZURE_API_VERSION } from "./lib/chatClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(__dirname, "results", "baselines", "self-correcting-interviewer");

const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const INTERVIEWER = process.env.EVAL_INTERVIEWER_MODEL || "gpt-5.4";
const PERSONA = process.env.ONTOLOGY_EVAL_PERSONA_MODEL || "gpt-4o-mini-internal";

const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`); return ok; };

if (!endpoint || !apiKey) { console.error("AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are required."); process.exit(1); }

// 1. Both deployments exist and answer. A deployment name is not a model id on
//    Azure -- `gpt-4o-mini` is deployed here as `gpt-4o-mini-internal`, which
//    is what produced the last 404.
const config = { provider: "azure", endpoint, apiKey, apiVersion: process.env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION };
for (const [role, model] of [["interviewer", INTERVIEWER], ["persona/classifier", PERSONA]]) {
  try {
    const call = await chatOnce({ config, model, systemPrompt: "Reply with the single word OK.", userPrompt: "go", label: `preflight ${role}` });
    check(`${role} deployment "${model}" answers`, /ok/i.test(call.reply), `resolved as ${call.modelReported}`);
  } catch (err) {
    check(`${role} deployment "${model}" answers`, false, String(err.message).slice(0, 160));
  }
}

// 2. Two real two-turn interviews, one per arm, through the actual runner.
const scratchRuns = [];
for (const arm of ["control", "treatment"]) {
  const runId = "preflight";
  const dir = path.join(OUT, arm, runId);
  fs.rmSync(dir, { recursive: true, force: true });
  scratchRuns.push(dir);
  const proc = spawnSync(process.execPath, ["tests/evals/self-correction-eval.mjs", `--arm=${arm}`, `--run=${runId}`], {
    cwd: ROOT, encoding: "utf8",
    env: { ...process.env, ONTOLOGY_EVAL_MAX_TURNS: "2", ONTOLOGY_EVAL_WALLCLOCK_MINUTES: "8", ONTOLOGY_EVAL_PERSONA_MODEL: PERSONA },
  });
  const prov = fs.existsSync(path.join(dir, "baseline-provenance.json"))
    ? JSON.parse(fs.readFileSync(path.join(dir, "baseline-provenance.json"), "utf8")) : null;
  if (!check(`${arm}: a two-turn interview completes end to end`, Boolean(prov),
    prov ? `${prov.turnsUsed} turns` : `exit ${proc.status}: ${(proc.stderr || "").trim().split("\n").slice(-2).join(" ").slice(0, 200)}`)) continue;

  check(`${arm}: checkpoint written during the run`, fs.existsSync(path.join(dir, "checkpoint", "conversation-log.md")));
  check(`${arm}: transcript has real content`, fs.readFileSync(path.join(dir, "conversation-log.md"), "utf8").length > 500);
  check(`${arm}: persona and classifier both answered`, prov.stoppedReason !== "app_agent_produced_no_text_repeatedly", prov.stoppedReason);

  const raw = JSON.parse(fs.readFileSync(path.join(dir, "raw-api-log.json"), "utf8"));
  const withFindings = raw.filter((m) => m.role === "tool" && typeof m.content === "string" && m.content.includes("CONSISTENCY CHECK")).length;
  if (arm === "control") {
    check("control: interviewer prompt is the pre-#84 one", prov.interviewerPromptSha256 === "3554cef37978da3cf8eeef502182fd722e229d881260e7324cf4e6a75a2c173f");
    check("control: self-correction is off", prov.selfCorrectionEnabled === false);
    check("control: NO tool result carries findings", withFindings === 0, `${withFindings} carried findings`);
    check("control: at most one apply per turn", prov.maxAppliesInOneTurn <= 1, `max ${prov.maxAppliesInOneTurn}`);
  } else {
    check("treatment: interviewer prompt is the shipped #84 one", prov.interviewerPromptSha256 === "eff34f3e70f85419e078cbc3bfb827d7e0d58066b33a74c8db09df1e9f337fa2");
    check("treatment: self-correction is on", prov.selfCorrectionEnabled === true);
    // Only meaningful once the agent has actually committed something in two
    // turns; if it has not, that is not a failure of the plumbing.
    const applied = prov.applyToolCalls > 0;
    check("treatment: tool results carry findings once anything is committed",
      !applied || withFindings > 0, applied ? `${withFindings} of ${prov.applyToolCalls} applies` : "nothing committed in 2 turns — not exercised");
  }
}

// 3. Idempotence: a completed run is skipped, not re-spent.
const again = spawnSync(process.execPath, ["tests/evals/self-correction-eval.mjs", "--arm=control", "--run=preflight"], { cwd: ROOT, encoding: "utf8", env: process.env });
check("a completed run is skipped rather than re-spent", /already complete/.test(again.stdout || ""));

for (const dir of scratchRuns) fs.rmSync(dir, { recursive: true, force: true });
console.log("\nScratch runs deleted — nothing here can be mistaken for a result.");

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) { console.error("PREFLIGHT FAILED — do not launch the batch."); process.exit(1); }
console.log("PREFLIGHT PASSED — safe to launch the batch.");
