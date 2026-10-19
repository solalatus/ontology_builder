import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  llmEnv, resolveLlmProvider, resolveLlmConfig, missingCredentials, requireCredentials,
  defaultModel, modelIdFor, chatRequestFor, bedrockChatPath, normalizeBedrockEndpoint,
  isWrongBedrockRoute, providerProvenance, cheapPersonaModel,
} from "./lib/llmProvider.mjs";
import { chatOnce, resolveClientConfig, providerChat } from "./evals/lib/chatClient.mjs";
import { liveChatUrlPattern, liveModelsUrlPattern, replyMessage } from "./lib/liveProvider.mjs";

// Issue #183: every Node-side caller resolves its provider here, so one
// .env change moves the live tests, evals and experiment scripts together.
// Pure, offline: no key, no network (fetch is replaced where a call is made).

function withEnvFile(lines, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "llm-env-"));
  const envPath = path.join(dir, ".env");
  fs.writeFileSync(envPath, lines.join("\n"));
  try { return fn(envPath); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test("the .env file and the real environment merge, the environment winning", () => {
  withEnvFile(["# c", "AWS_BEARER_TOKEN_BEDROCK=from-file", "AWS_REGION='us-west-2'", "LLM_MODEL=\"m\""], (envPath) => {
    const env = llmEnv({ envPath, processEnv: { AWS_REGION: "eu-central-1", EMPTY: "" } });
    assert.equal(env.AWS_BEARER_TOKEN_BEDROCK, "from-file");
    assert.equal(env.AWS_REGION, "eu-central-1");
    assert.equal(env.LLM_MODEL, "m");
    assert.equal("EMPTY" in env, false, "an empty environment value doesn't shadow the file");
  });
  assert.deepEqual(llmEnv({ envPath: "/nonexistent/.env", processEnv: {} }), {});
});

test("the provider follows LLM_PROVIDER, else the credentials present", () => {
  assert.equal(resolveLlmProvider({}), "openai");
  assert.equal(resolveLlmProvider({ OPENAI_API_KEY: "sk" }), "openai");
  assert.equal(resolveLlmProvider({ AWS_BEARER_TOKEN_BEDROCK: "ABSK" }), "bedrock");
  assert.equal(resolveLlmProvider({ AZURE_OPENAI_ENDPOINT: "https://r", AWS_BEARER_TOKEN_BEDROCK: "ABSK" }), "azure");
  assert.equal(resolveLlmProvider({ AZURE_OPENAI_ENDPOINT: "https://r", AWS_BEARER_TOKEN_BEDROCK: "ABSK", LLM_PROVIDER: "Bedrock" }), "bedrock");
  assert.equal(resolveLlmProvider({ EVAL_PROVIDER: "openai", AZURE_OPENAI_ENDPOINT: "https://r" }), "openai", "the older EVAL_PROVIDER still works");
  assert.throws(() => resolveLlmProvider({ LLM_PROVIDER: "vertex" }), /openai, azure, bedrock/);
});

test("each provider's config, and what's missing when it isn't usable", () => {
  const bedrock = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "ABSKkey" });
  assert.deepEqual(bedrock, { provider: "bedrock", apiKey: "ABSKkey", endpoint: "https://bedrock-mantle.us-east-1.api.aws", apiVersion: null, region: "us-east-1" });
  assert.equal(resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k", AWS_DEFAULT_REGION: "us-east-2" }).endpoint, "https://bedrock-mantle.us-east-2.api.aws");
  assert.equal(resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k", BEDROCK_ENDPOINT: "https://proxy.example.com/openai/v1/" }).endpoint, "https://proxy.example.com");

  const azure = resolveLlmConfig({ AZURE_OPENAI_ENDPOINT: "https://r.openai.azure.com/", AZURE_OPENAI_API_KEY: "k" });
  assert.deepEqual(azure, { provider: "azure", apiKey: "k", endpoint: "https://r.openai.azure.com", apiVersion: "2024-12-01-preview", region: null });

  const openai = resolveLlmConfig({});
  assert.equal(openai.provider, "openai");
  assert.match(missingCredentials(openai), /OPENAI_API_KEY/);
  assert.match(missingCredentials(resolveLlmConfig({ LLM_PROVIDER: "bedrock" })), /AWS_BEARER_TOKEN_BEDROCK/);
  assert.equal(missingCredentials(bedrock), null);
  assert.throws(() => requireCredentials(openai), /OPENAI_API_KEY/);
  assert.throws(() => resolveClientConfig({ LLM_PROVIDER: "azure" }), /AZURE_OPENAI_ENDPOINT/);
  assert.equal(resolveClientConfig({ AWS_BEARER_TOKEN_BEDROCK: "k" }).provider, "bedrock");
});

test("model naming: LLM_MODEL, then the provider's own variable, then the default in the provider's naming", () => {
  const bedrock = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k" });
  const azure = resolveLlmConfig({ AZURE_OPENAI_ENDPOINT: "https://r", AZURE_OPENAI_API_KEY: "k" });
  assert.equal(defaultModel(bedrock, "gpt-5.4", {}), "openai.gpt-5.4");
  assert.equal(defaultModel(bedrock, "gpt-5.4", { BEDROCK_MODEL: "openai.gpt-6.1-sol" }), "openai.gpt-6.1-sol");
  assert.equal(defaultModel(bedrock, "gpt-5.4", { LLM_MODEL: "x", BEDROCK_MODEL: "y" }), "x");
  assert.equal(defaultModel(azure, "gpt-5.4", { AZURE_OPENAI_DEPLOYMENT: "prod" }), "prod");
  assert.equal(defaultModel(azure, "gpt-5.4", {}), "gpt-5.4");
  assert.equal(defaultModel(bedrock, null, {}), null);
  assert.equal(modelIdFor(bedrock, "openai.gpt-5.4"), "openai.gpt-5.4", "already Bedrock-named");
  assert.equal(modelIdFor(bedrock, "us.openai.gpt-5.4"), "us.openai.gpt-5.4");
  assert.equal(modelIdFor(resolveLlmConfig({}), "gpt-5.4"), "gpt-5.4");
  assert.equal(cheapPersonaModel(azure, "gpt-5.4"), "gpt-4o-mini-internal");
  assert.equal(cheapPersonaModel(resolveLlmConfig({}), "gpt-5.4"), "gpt-4o-mini");
  assert.equal(cheapPersonaModel(bedrock, "openai.gpt-5.4"), "openai.gpt-5.4");
});

test("request shape per provider, matching the app's", () => {
  const bedrock = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "ABSKkey" });
  assert.deepEqual(chatRequestFor(bedrock, "openai.gpt-6.1-sol"), {
    url: "https://bedrock-mantle.us-east-1.api.aws/openai/v1/chat/completions",
    headers: { Authorization: "Bearer ABSKkey", "Content-Type": "application/json" },
    includeModelInBody: true,
  });
  assert.equal(chatRequestFor(bedrock, "openai.gpt-oss-120b").url, "https://bedrock-mantle.us-east-1.api.aws/v1/chat/completions");
  const azure = resolveLlmConfig({ AZURE_OPENAI_ENDPOINT: "https://r", AZURE_OPENAI_API_KEY: "k" });
  const a = chatRequestFor(azure, "my dep");
  assert.equal(a.url, "https://r/openai/deployments/my%20dep/chat/completions?api-version=2024-12-01-preview");
  assert.deepEqual(a.headers, { "api-key": "k", "Content-Type": "application/json" });
  assert.equal(a.includeModelInBody, false);
  assert.equal(chatRequestFor(resolveLlmConfig({ OPENAI_API_KEY: "sk" }), "gpt-5.4").url, "https://api.openai.com/v1/chat/completions");

  assert.deepEqual(["openai.gpt-6.1-sol", "openai.gpt-oss-20b", "x"].map(bedrockChatPath), ["/openai/v1", "/v1", "/v1"]);
  assert.equal(normalizeBedrockEndpoint(" https://h/v1/ "), "https://h");
  assert.equal(normalizeBedrockEndpoint(""), null);
  assert.equal(isWrongBedrockRoute(400, { error: { message: "model `x` isn't supported on this route" } }), true);
  assert.equal(isWrongBedrockRoute(400, { error: { message: "bad tools" } }), false);
  assert.deepEqual(providerProvenance(bedrock), { provider: "bedrock", endpoint: "https://bedrock-mantle.us-east-1.api.aws", apiVersion: null, region: "us-east-1" });
  assert.equal(JSON.stringify(providerProvenance(bedrock)).includes("ABSKkey"), false, "provenance never carries the key");
});

test("the live relay patterns cover the app's model calls per provider, Responses API included", () => {
  const bedrock = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k" });
  const b = liveChatUrlPattern(bedrock);
  const mantle = "https://bedrock-mantle.us-east-1.api.aws";
  assert.deepEqual([`${mantle}/openai/v1/chat/completions`, `${mantle}/v1/chat/completions`, `${mantle}/openai/v1/responses`, `${mantle}/v1/models`].map((u) => b.test(u)), [true, true, true, false]);
  assert.equal(liveModelsUrlPattern(bedrock), `${mantle}/v1/models`);
  const azure = resolveLlmConfig({ AZURE_OPENAI_ENDPOINT: "https://r", AZURE_OPENAI_API_KEY: "k" });
  const a = liveChatUrlPattern(azure);
  assert.deepEqual(["https://r/openai/deployments/sol/chat/completions?api-version=x", "https://r/openai/v1/responses", "https://r/openai/deployments?api-version=x"].map((u) => a.test(u)), [true, true, false]);
  assert.equal(liveChatUrlPattern(resolveLlmConfig({})), "https://api.openai.com/v1/chat/completions");
});

test("replyMessage reads a relayed answer from either API", () => {
  assert.deepEqual(replyMessage({ body: { choices: [{ message: { role: "assistant", content: "Hi" } }] } }), { role: "assistant", content: "Hi" });
  assert.deepEqual(replyMessage({ body: { output: [
    { type: "reasoning" },
    { type: "message", content: [{ type: "output_text", text: "Hi" }] },
    { type: "function_call", call_id: "c", name: "f", arguments: "{}" },
  ] } }), { role: "assistant", content: "Hi", tool_calls: [{ id: "c", type: "function", function: { name: "f", arguments: "{}" } }] });
  assert.equal(replyMessage({ body: { error: { message: "x" } } }), null);
});

// --- chatClient on Bedrock -----------------------------------------------------

function mockFetch(responder) {
  const real = global.fetch;
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    const { status, body } = responder(url, calls.length);
    return { ok: status < 300, status, headers: { get: () => null }, text: async () => JSON.stringify(body) };
  };
  return { calls, restore: () => { global.fetch = real; } };
}

const OK = { choices: [{ message: { content: "OK" }, finish_reason: "stop" }], usage: { prompt_tokens: 3, completion_tokens: 1, total_tokens: 4 }, model: "openai.gpt-6.1-sol" };

test("chatOnce on Bedrock: Bearer key, model in the body, provider in the request params", async () => {
  const config = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "ABSKkey" });
  const m = mockFetch(() => ({ status: 200, body: OK }));
  try {
    const call = await chatOnce({ config, model: "openai.gpt-6.1-sol", systemPrompt: "s", userPrompt: "u" });
    assert.equal(call.reply, "OK");
    assert.equal(m.calls[0].url, "https://bedrock-mantle.us-east-1.api.aws/openai/v1/chat/completions");
    assert.equal(m.calls[0].headers.Authorization, "Bearer ABSKkey");
    assert.equal(m.calls[0].body.model, "openai.gpt-6.1-sol");
    assert.equal(call.requestParams.provider, "bedrock");
    assert.equal(call.requestParams.region, "us-east-1");
    assert.equal(call.requestParams.endpoint, "https://bedrock-mantle.us-east-1.api.aws");
  } finally { m.restore(); }
});

test("chatOnce on Bedrock retries once under the other path prefix when the route is wrong", async () => {
  const config = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k" });
  const m = mockFetch((url) => url.includes("/openai/v1/")
    ? { status: 400, body: { error: { message: "model `openai.gpt-5.4` isn't supported on this route" } } }
    : { status: 200, body: OK });
  try {
    const call = await chatOnce({ config, model: "openai.gpt-5.4", systemPrompt: "s", userPrompt: "u" });
    assert.equal(call.reply, "OK");
    assert.deepEqual(m.calls.map((c) => c.url), [
      "https://bedrock-mantle.us-east-1.api.aws/openai/v1/chat/completions",
      "https://bedrock-mantle.us-east-1.api.aws/v1/chat/completions",
    ]);
  } finally { m.restore(); }
});

test("a wrong route on both prefixes fails with the provider's message, not a loop", async () => {
  const config = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k" });
  const m = mockFetch(() => ({ status: 400, body: { error: { message: "model `m` isn't supported on this route" } } }));
  try {
    await assert.rejects(chatOnce({ config, model: "openai.gpt-6.1-sol", systemPrompt: "s", userPrompt: "u" }), /HTTP 400 model `m` isn't supported on this route/);
    assert.equal(m.calls.length, 2);
  } finally { m.restore(); }
});

test("providerChat is the harness `chat` shape, and collects usage", async () => {
  const config = resolveLlmConfig({ AWS_BEARER_TOKEN_BEDROCK: "k" });
  const usages = [];
  const m = mockFetch(() => ({ status: 200, body: OK }));
  try {
    const chat = providerChat(config, { usages });
    const r = await chat([{ role: "user", content: "hi" }], "openai.gpt-6.1-sol", { temperature: 0 });
    assert.deepEqual(r, { text: "OK", usage: OK.usage, finishReason: "stop" });
    assert.equal(m.calls[0].body.temperature, 0, "extraBody passes through");
    assert.deepEqual(usages, [OK.usage]);
  } finally { m.restore(); }
});
