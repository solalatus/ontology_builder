import { test } from "node:test";
import assert from "node:assert/strict";
import { loadEnvKey } from "./lib/env.mjs";
import { withPageAllowingResourceErrors } from "./lib/liveOpenAi.mjs";
import { sendChatMessage, connectAgentLiveBedrock, forwardToRealBedrock, liveChatUrlPattern, unexpectedFailures, replyMessage } from "./lib/liveProvider.mjs";
import { resolveLlmConfig } from "./lib/llmProvider.mjs";
import { chatOnce } from "./evals/lib/chatClient.mjs";

// LIVE AWS Bedrock suite (issue #183), the counterpart of
// helper-agent-live-azure.spec.mjs and the mocked
// helper-agent-bedrock.spec.mjs. Opt-in: skipped unless
// AWS_BEARER_TOKEN_BEDROCK is set (env or the gitignored repo-root .env);
// AWS_REGION / BEDROCK_ENDPOINT / BEDROCK_MODEL are honoured. Never runs in
// CI. Costs a few small calls.
//
// Same relay as every live suite: headless Chromium in this sandbox can't
// dial out, so the page's real requests go through Node's fetch untouched
// (see helper-agent-live-openai.spec.mjs's file header).

const KEY = loadEnvKey("AWS_BEARER_TOKEN_BEDROCK");
const skip = KEY ? false
  : "Set AWS_BEARER_TOKEN_BEDROCK (optionally AWS_REGION, BEDROCK_MODEL) in a .env file at the repo root (see tests/README.md) to run live AWS Bedrock tests.";
const CONFIG = KEY ? resolveLlmConfig({
  LLM_PROVIDER: "bedrock",
  AWS_BEARER_TOKEN_BEDROCK: KEY,
  AWS_REGION: loadEnvKey("AWS_REGION") || loadEnvKey("AWS_DEFAULT_REGION") || "",
  BEDROCK_ENDPOINT: loadEnvKey("BEDROCK_ENDPOINT") || "",
}) : null;
const MODEL = loadEnvKey("BEDROCK_MODEL");

// What the app's design rests on, checked against the real service: a
// browser can only call bedrock-mantle. Needs no key.
test("live: bedrock-mantle answers a browser's CORS preflight; bedrock-runtime's OpenAI route does not", { skip }, async () => {
  const preflight = (url) => fetch(url, {
    method: "OPTIONS",
    headers: { Origin: "https://example.github.io", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type" },
  });
  const mantle = await preflight(`${CONFIG.endpoint}/openai/v1/chat/completions`);
  assert.equal(mantle.status, 200);
  assert.equal(mantle.headers.get("access-control-allow-origin"), "*");
  const runtime = await preflight(`https://bedrock-runtime.${CONFIG.region}.amazonaws.com/openai/v1/chat/completions`);
  console.log(`[live #183] preflight mantle=${mantle.status} runtime=${runtime.status} runtime-acao=${runtime.headers.get("access-control-allow-origin")}`);
  assert.equal(runtime.headers.get("access-control-allow-origin"), null, "if this starts passing, bedrock-runtime became browser-callable and the app could offer it");
});

test("live: the key lists OpenAI models on bedrock-mantle, and the app preselects GPT-6.1 Sol when the region serves it", { skip }, async () => {
  await withPageAllowingResourceErrors(async (page) => {
    const modelResponses = await connectAgentLiveBedrock(page, CONFIG);
    assert.equal(modelResponses.length, 1);
    assert.equal(modelResponses[0].status, 200, `bedrock-mantle rejected the model listing: ${JSON.stringify(modelResponses[0].body)}`);
    const listed = (modelResponses[0].body.data || []).map((m) => m.id);
    const offered = await page.evaluate(() => window.__kg.agent.state.models.map((m) => m.id));
    const selected = await page.evaluate(() => window.__kg.agent.state.model);
    console.log(`[live #183] region=${CONFIG.region} listed=${listed.length} openai=${JSON.stringify(offered)} selected=${selected}`);
    assert.ok(offered.length > 0, `no OpenAI model listed for this key; listed: ${listed.join(", ")}`);
    assert.ok(offered.every((id) => /(^|\.)openai\./.test(id)));
    if (offered.includes("openai.gpt-6.1-sol")) assert.equal(selected, "openai.gpt-6.1-sol", "the pinned model (#178) is the default");
  });
});

// The whole request shape at once: tools attached, prompt_cache_key sent,
// model in the body, Bearer key -- the call the interview makes every turn.
// Then the same long prefix again, which the cache should serve.
test("live: a real tool-attached interview turn works, prompt_cache_key is accepted, and a repeated prefix reports cached tokens", { skip }, async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgentLiveBedrock(page, CONFIG, { model: MODEL });
    const model = await page.evaluate(() => window.__kg.agent.state.model);
    const requests = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && /\/(chat\/completions|responses)$/.test(req.url())) requests.push({ url: req.url(), body: req.postDataJSON() });
    });
    const chatResponses = forwardToRealBedrock(page, liveChatUrlPattern(CONFIG));

    // Mid-interview, as in real use: the app's interviewer settles
    // competency questions before modelling, and a reasoning model holds
    // to that over a one-line directive on an empty canvas.
    await page.evaluate(() => window.__kg.formats.commitYamlImport(
      "competency_questions:\n  - text: Which supplier issued a given payment request?\n", "merge"));
    const before = await page.evaluate(() => window.__kg.state.nodes.length);
    await sendChatMessage(page, "Add a class called Invoice, meaning: a request from a supplier to receive payment. "
      + "Use the apply_ontology_yaml tool right now to add it — don't just describe it in text.", { timeout: 180000 });
    await sendChatMessage(page, "Thanks. Reply with one short sentence, no tool calls needed.", { timeout: 180000 });

    const state = await page.evaluate(() => ({
      usage: window.__kg.agent.state.usage,
      rejected: window.__kg.agent.state.promptCacheKeyRejected,
      routes: window.__kg.agent.state.bedrockRoutes,
      transcript: window.__kg.agent.state.transcript.filter((m) => m.role === "system").map((m) => m.text),
    }));
    const statuses = chatResponses.map((r) => r.status);
    console.log(`[live #183] model=${model} statuses=${statuses.join(",")} urls=${[...new Set(requests.map((r) => r.url))].join(" ")} `
      + `routes=${JSON.stringify(state.routes)} cacheKeyRejected=${state.rejected} `
      + `prompt=${state.usage.map((e) => e.usage && e.usage.prompt_tokens).join(",")} `
      + `cached=${state.usage.map((e) => (e.usage && e.usage.prompt_tokens_details || {}).cached_tokens ?? "n/a").join(",")} `
      + `cache_write=${state.usage.map((e) => (e.usage && e.usage.prompt_tokens_details || {}).cache_write_tokens ?? "n/a").join(",")}`);

    assert.deepEqual(state.transcript, [], `the app reported an error: ${state.transcript.join(" | ")}`);
    assert.equal(state.rejected, false, "Bedrock rejected prompt_cache_key");
    assert.deepEqual(unexpectedFailures(chatResponses), []);
    assert.equal(chatResponses[chatResponses.length - 1].status, 200);
    assert.ok(requests.every((r) => r.body.model === model && Array.isArray(r.body.tools) && /^kg-agent-/.test(r.body.prompt_cache_key || "")),
      "every interview call carries the model, the tools and the connection's cache key");
    assert.equal(new Set(requests.map((r) => r.body.prompt_cache_key)).size, 1, "one cache key per connection");

    const sawToolCall = chatResponses.some((r) => {
      const msg = replyMessage(r);
      return msg && Array.isArray(msg.tool_calls) && msg.tool_calls.some((c) => c.function && c.function.name === "apply_ontology_yaml");
    });
    assert.ok(sawToolCall, "the model should call apply_ontology_yaml for a directive request");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), before + 1);

    assert.ok(state.usage.length >= 3, "one usage entry per call (tool round + reply + second turn)");
    for (const e of state.usage) {
      assert.equal(e.provider, "bedrock");
      assert.equal(e.model, model);
      assert.ok(e.usage && typeof e.usage.prompt_tokens === "number", "Bedrock returned a usage object");
    }
    const cached = state.usage.slice(1).map((e) => (e.usage.prompt_tokens_details || {}).cached_tokens || 0);
    assert.ok(cached.some((c) => c > 0), `a later call with the same prefix should report cached_tokens > 0, got ${cached.join(", ")}`);
  });
});

test("live: the background checks run on Bedrock too (model-based consistency check)", { skip }, async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgentLiveBedrock(page, CONFIG, { model: MODEL });
    const chatResponses = forwardToRealBedrock(page, liveChatUrlPattern(CONFIG));
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), [
      "classes:", "  Invoice: {}", "  Supplier: {}",
      "relationships:", "  - name: issuedBy", "    from: Invoice", "    to: Supplier", "",
    ].join("\n"));
    await page.evaluate(() => window.__kg.consistency.llm.run());
    assert.ok(chatResponses.length >= 1);
    assert.equal(chatResponses[chatResponses.length - 1].status, 200);
    const kinds = await page.evaluate(() => window.__kg.agent.state.usage.map((e) => `${e.kind}:${e.provider}`));
    assert.ok(kinds.includes("consistency_llm:bedrock"), `got ${kinds.join(", ")}`);
  });
});

test("live: the Node-side client (evals, experiment scripts) answers on Bedrock", { skip }, async () => {
  const model = MODEL || "openai.gpt-6.1-sol";
  const call = await chatOnce({ config: CONFIG, model, systemPrompt: "Reply with the single word OK.", userPrompt: "go", label: "live bedrock" });
  console.log(`[live #183] node chatOnce model=${model} reported=${call.modelReported} reply=${JSON.stringify(call.reply.slice(0, 40))}`);
  assert.match(call.reply, /ok/i);
  assert.equal(call.requestParams.provider, "bedrock");
});
