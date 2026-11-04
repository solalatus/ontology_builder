import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  V1_SYSTEM_PROMPT, V1_TOOLS, V1_TOOL_NAMES, V1_SOURCE_SHA, V1_FIXTURE_SHA256, V2_SKIP_TEXT, V1_SKIP_TEXT,
  rewriteRequestBodyForV1, sha256,
} from "./evals/lib/interviewerGeneration.mjs";

// Revision 1, E1 (ontology_translation/results/v1-same-model/DESIGN.md): the
// first-generation interviewer as a harness condition. The arm must send the
// v1.0 prompt and only the v1.0 tools, with the repair loop off. Offline: the
// dry run uses the mock Azure resource, so no key and no network are needed.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const run = promisify(execFile);

test("the fixtures are v1.0's prompt and tools, verbatim", () => {
  assert.equal(sha256(V1_SYSTEM_PROMPT), V1_FIXTURE_SHA256.systemPrompt);
  assert.deepEqual(V1_TOOL_NAMES, ["apply_ontology_yaml", "get_graph_state"]);
  let src = null;
  try { src = execFileSync("git", ["show", `${V1_SOURCE_SHA}:index.html`], { cwd: ROOT, encoding: "utf8", maxBuffer: 1e8, stdio: ["ignore", "pipe", "ignore"] }); } catch { /* shallow clone */ }
  if (!src) return; // the pinned hash above still holds the fixture fixed
  const knowledgeAt = V1_SYSTEM_PROMPT.indexOf("\n\n\n## How to describe");
  assert.ok(knowledgeAt > 0);
  assert.ok(src.includes("const AGENT_SYSTEM_PROMPT_BASE = `" + V1_SYSTEM_PROMPT.slice(0, knowledgeAt) + "`;"), "prompt base is v1.0's AGENT_SYSTEM_PROMPT_BASE");
  for (const t of V1_TOOLS) {
    assert.ok(src.includes(`name: "${t.function.name}"`));
    for (const piece of t.function.description.split(/(?<=\. )/)) assert.ok(src.replace(/" \+\n\s+"/g, "").includes(piece.trim()), `${t.function.name} description: ${piece}`);
  }
});

test("every tool the v1 prompt names is offered, and no other tool is", () => {
  const named = new Set(V1_SYSTEM_PROMPT.match(/\b(apply_ontology_yaml|get_graph_state|[a-z]+_ontology_[a-z_]+|[a-z]+_graph_[a-z_]+)\b/g));
  for (const n of named) assert.ok(V1_TOOL_NAMES.includes(n), `prompt names ${n}, which the arm does not offer`);
  assert.doesNotMatch(V1_SYSTEM_PROMPT, /remove_ontology|rename_ontology/);
  assert.equal(V1_TOOLS[1].function.parameters.properties && Object.keys(V1_TOOLS[1].function.parameters.properties).length, 0, "v1 get_graph_state takes no arguments");
});

const V2_TOOLS = ["apply_ontology_yaml", "get_graph_state", "remove_ontology_elements", "rename_ontology_elements"]
  .map((name) => ({ type: "function", function: { name, description: "v2", parameters: { type: "object", properties: {} } } }));

test("the relay rewrite: Chat Completions shape", () => {
  const body = { messages: [{ role: "system", content: "S" }, { role: "tool", tool_call_id: "a", content: V2_SKIP_TEXT }, { role: "tool", tool_call_id: "b", content: "Applied." }], tools: V2_TOOLS, tool_choice: "auto" };
  const { body: out, rewrote } = rewriteRequestBodyForV1(JSON.stringify(body));
  const b = JSON.parse(out);
  assert.deepEqual(b.tools, V1_TOOLS);
  assert.equal(b.messages[1].content, V1_SKIP_TEXT);
  assert.equal(b.messages[2].content, "Applied.");
  assert.equal(b.messages[0].content, "S");
  assert.equal(b.tool_choice, "auto");
  assert.deepEqual(rewrote, ["tools(chat)", "skip-note"]);
});

test("the relay rewrite: Responses shape, and bodies without tools pass untouched", () => {
  const body = { model: "m", input: [{ role: "system", content: "S" }, { type: "function_call_output", call_id: "a", output: V2_SKIP_TEXT }], tools: V2_TOOLS.map((t) => ({ type: "function", ...t.function })) };
  const b = JSON.parse(rewriteRequestBodyForV1(JSON.stringify(body)).body);
  assert.deepEqual(b.tools, V1_TOOLS.map((t) => ({ type: "function", ...t.function })));
  assert.equal(b.input[1].output, V1_SKIP_TEXT);
  const plain = JSON.stringify({ messages: [{ role: "user", content: V2_SKIP_TEXT }] });
  assert.equal(rewriteRequestBodyForV1(plain).body, plain);
});

const MOCK_ENV = {
  MOCK_AZURE_ENDPOINT: "https://mock-resource.openai.azure.com", LLM_PROVIDER: "azure",
  AZURE_OPENAI_ENDPOINT: "https://mock-resource.openai.azure.com", AZURE_OPENAI_API_KEY: "mock-key", LLM_MODEL: "gpt-6-sol",
  ONTOLOGY_EVAL_SNAPSHOT_AT_WRAPUP: "1", ONTOLOGY_EVAL_COVERAGE_SWEEP: "", ONTOLOGY_EVAL_NAMING_PASS: "",
  ONTOLOGY_EVAL_APP_TURN_TIMEOUT_SEC: "60", EVAL_RUN_COST_CAP_USD: "5",
};
const runner = (args, env) => run(process.execPath, ["--import", "./tests/lib/mockAzureFetch.mjs", ...args], { cwd: ROOT, timeout: 280000, env: { ...process.env, ...MOCK_ENV, ...env } });

test("dry run: the v1 arm sends the v1.0 prompt and only the v1.0 tools, repair loop off, to the wrap-up", { timeout: 600000 }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "v1-dry-"));
  try {
    await runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=dry-01", `--resultsDir=${root}`], { ONTOLOGY_EVAL_INTERVIEWER_GENERATION: "v1" });
    const dir = path.join(root, "dry-01", "brick-hvac");
    const prov = JSON.parse(fs.readFileSync(path.join(dir, "provenance.json"), "utf8"));
    assert.equal(prov.status, "complete");
    assert.equal(prov.stoppedReason, "stages_complete");
    assert.equal(prov.interviewerGeneration, "v1");
    assert.equal(prov.v1Interviewer.sourceSha, V1_SOURCE_SHA);
    assert.equal(prov.v1Interviewer.systemPromptSha256, V1_FIXTURE_SHA256.systemPrompt);
    assert.equal(prov.v1Interviewer.selfCorrectionDisabled, true);
    assert.deepEqual(prov.v1Interviewer.relayAudit.violations, []);
    assert.ok(prov.v1Interviewer.relayAudit.toolRequests >= 1);
    const directive = "\n\n---\nOUTPUT LANGUAGE: English (en). Always reply in this language, regardless of what language the user writes in, unless they explicitly ask you to switch.\n---";
    assert.equal(prov.interviewerPromptSha256, sha256(V1_SYSTEM_PROMPT + directive));
    // The repair loop is off: no consistency findings reach any tool result.
    assert.doesNotMatch(fs.readFileSync(path.join(dir, "tool-calls.md"), "utf8"), /CONSISTENCY CHECK/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test("an unknown generation, or a generation combined with a baseline condition, is refused before anything runs", async () => {
  await assert.rejects(runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=x", "--resultsDir=/nonexistent"], { ONTOLOGY_EVAL_INTERVIEWER_GENERATION: "v9" }), /Unknown ONTOLOGY_EVAL_INTERVIEWER_GENERATION/);
  await assert.rejects(runner(["tests/evals/run-multi-domain-benchmark.mjs", "--domain=brick-hvac", "--run=x", "--resultsDir=/nonexistent"], { ONTOLOGY_EVAL_INTERVIEWER_GENERATION: "v1", ONTOLOGY_EVAL_CONDITION: "b3-no-commit" }), /cannot be combined/);
});
