// Provider-agnostic live helpers (issue #183): connect the app to whichever
// provider tests/lib/llmProvider.mjs resolved, and relay its real requests.
// OpenAI and Azure keep their own modules (liveOpenAi.mjs,
// liveAzureOpenAi.mjs), which this one dispatches to; Bedrock's relay and
// connect flow live here.
//
// Why a relay at all: headless Chromium in this sandbox can't dial out, so
// every live test forwards the page's real request through Node's fetch
// (see tests/helper-agent-live-openai.spec.mjs's file header).
import {
  CHAT_URL, RESPONSES_URL, MODELS_URL, forwardToRealOpenAi, connectAgentLive, openPanel, sendChatMessage,
  RATE_LIMIT_MAX_ATTEMPTS, sleepMs, isInsufficientQuotaError,
} from "./liveOpenAi.mjs";
import { forwardToRealAzure, connectAgentLiveAzure } from "./liveAzureOpenAi.mjs";
import { tpmBackoffMs, TPM_MAX_ATTEMPTS } from "../evals/lib/chatClient.mjs";
import { resolveLlmConfig, missingCredentials, defaultModel, llmEnv } from "./llmProvider.mjs";

export { openPanel, sendChatMessage, resolveLlmConfig, missingCredentials, defaultModel, llmEnv };

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The app's model calls for the resolved provider: Chat Completions, and the
 * Responses API that tool calls move to on models that need it (issue #183).
 */
export function liveChatUrlPattern(config) {
  const base = escapeRegExp(config.endpoint);
  if (config.provider === "azure") return new RegExp(`^${base}/openai/(deployments/[^/]+/chat/completions|v1/responses)(\\?|$)`);
  if (config.provider === "bedrock") return new RegExp(`^${base}/(openai/)?v1/(chat/completions|responses)$`);
  return CHAT_URL;
}

export function liveModelsUrlPattern(config) {
  if (config.provider === "azure") return `${config.endpoint}/openai/deployments**`;
  if (config.provider === "bedrock") return `${config.endpoint}/v1/models`;
  return MODELS_URL;
}

// Relays to bedrock-mantle with the app's own Authorization header (not one
// re-derived here), so the app's header choice is what's under test. Retries
// a transient 429 with the TPM-aware backoff every other relay uses.
export function forwardToRealBedrock(page, urlPattern) {
  const responses = [];
  page.route(urlPattern, async (route) => {
    const req = route.request();
    let res, text;
    const maxAttempts = Math.max(RATE_LIMIT_MAX_ATTEMPTS, TPM_MAX_ATTEMPTS);
    let retries = 0;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        res = await fetch(req.url(), {
          method: req.method(),
          headers: { Authorization: req.headers()["authorization"], "Content-Type": "application/json" },
          body: req.method() === "GET" ? undefined : req.postData(),
        });
        text = await res.text();
      } catch (err) {
        await route.fulfill({ status: 599, contentType: "application/json", body: JSON.stringify({ error: { message: String(err) } }) });
        return;
      }
      if (res.status !== 429 || attempt >= maxAttempts) break;
      let parsedErr = null;
      try { parsedErr = JSON.parse(text); } catch (err) { /* non-JSON error body */ }
      if (isInsufficientQuotaError(parsedErr)) break;
      retries++;
      await sleepMs(tpmBackoffMs(attempt, Number(res.headers.get("retry-after"))));
    }
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (err) { /* non-JSON body, leave parsed null */ }
    responses.push({ status: res.status, url: req.url(), body: parsed, retries });
    await route.fulfill({ status: res.status, contentType: "application/json", body: text });
  });
  return responses;
}

/** Relays the app's chat calls to the real provider; returns the responses seen. */
export function forwardChatToRealProvider(page, config) {
  if (config.provider === "azure") return forwardToRealAzure(page, liveChatUrlPattern(config));
  if (config.provider === "bedrock") return forwardToRealBedrock(page, liveChatUrlPattern(config));
  return forwardToRealOpenAi(page, RESPONSES_URL, forwardToRealOpenAi(page, CHAT_URL));
}

async function selectModel(page, model) {
  const ids = await page.$$eval("#agent-model-select-modal option", (os) => os.map((o) => o.value));
  if (!ids.includes(model)) throw new Error(`model "${model}" is not offered for this key: ${ids.join(", ")}`);
  await page.selectOption("#agent-model-select-modal", model);
}

// The real connect flow against bedrock-mantle: configure the region (or
// endpoint override) in the Bedrock popup, list models, optionally pick one,
// finalise. Returns the relayed model-list responses.
export async function connectAgentLiveBedrock(page, config, { model = null, reasoningEffort = null } = {}) {
  const modelResponses = forwardToRealBedrock(page, liveModelsUrlPattern(config));
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", config.apiKey);
  const pending = await page.evaluate(() => window.__kg.agent.getPendingBedrock());
  const defaultHost = `https://bedrock-mantle.${config.region}.api.aws`;
  const wanted = { region: config.region, endpoint: config.endpoint === defaultHost ? null : config.endpoint };
  if (!pending || pending.region !== wanted.region || pending.endpoint !== wanted.endpoint) {
    await page.click("#agent-bedrock-config-open");
    await page.fill("#agent-bedrock-region-input", wanted.region);
    await page.fill("#agent-bedrock-endpoint-input", wanted.endpoint || "");
    await page.click("#agent-bedrock-config-save");
  }
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });
  if (model) await selectModel(page, model);
  if (reasoningEffort) await page.selectOption("#agent-reasoning-effort-select", reasoningEffort);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}

/**
 * Connects the app to the resolved provider. `model` (optional) is picked
 * instead of the app's own default: a model id on OpenAI and Bedrock, a
 * deployment name on Azure.
 */
export async function connectAgentLiveProvider(page, config, { model = null, reasoningEffort = null } = {}) {
  if (config.provider === "azure") return connectAgentLiveAzure(page, config.apiKey, config.endpoint, { deployment: model, reasoningEffort });
  if (config.provider === "bedrock") return connectAgentLiveBedrock(page, config, { model, reasoningEffort });
  if (!model && !reasoningEffort) return connectAgentLive(page, config.apiKey);
  const modelResponses = forwardToRealOpenAi(page, MODELS_URL);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", config.apiKey);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });
  if (model) await selectModel(page, model);
  if (reasoningEffort) await page.selectOption("#agent-reasoning-effort-select", reasoningEffort);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}

// The app answers three specific 400s by correcting the call once and
// retrying it (callAgentChatRaw in index.html): a Bedrock model on the
// other path prefix, a rejected prompt_cache_key, and a model that takes
// function tools only with reasoning_effort "none". A relay sees that first
// 400 too; it is the correction working, not a failure.
export function isOneTimeCorrection(response) {
  if (!response || response.status !== 400 && response.status !== 404) return false;
  const message = (response.body && response.body.error && response.body.error.message) || "";
  return /supported on this route/i.test(message)
    || (/prompt_cache_key/i.test(message) && /unknown|unrecogni[sz]ed|unsupported|not supported|not allowed|not permitted|extra|invalid/i.test(message))
    || (/function tools/i.test(message) && /reasoning_effort/i.test(message));
}

/** Relayed responses that failed for any other reason. */
export function unexpectedFailures(responses) {
  return responses.filter((r) => r.status !== 200 && !isOneTimeCorrection(r)).map((r) => ({ status: r.status, body: r.body }));
}

/**
 * The assistant message of a relayed response in Chat Completions' shape,
 * whichever API answered (a Responses API body has `output` items).
 */
export function replyMessage(response) {
  const body = response && response.body;
  if (!body) return null;
  if (Array.isArray(body.choices)) return (body.choices[0] && body.choices[0].message) || null;
  if (!Array.isArray(body.output)) return null;
  const text = body.output.filter((o) => o.type === "message").flatMap((o) => o.content || []).filter((p) => p.type === "output_text").map((p) => p.text).join("");
  const toolCalls = body.output.filter((o) => o.type === "function_call")
    .map((o) => ({ id: o.call_id, type: "function", function: { name: o.name, arguments: o.arguments } }));
  return { role: "assistant", content: text || null, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) };
}

/**
 * Sends a directive request until the model makes `toolName` -- at most
 * `tries` times, each retry in a new conversation. For live tests that
 * check plumbing (does a real tool call land?), not the model's judgement:
 * a reasoning model at an explicit effort sometimes asks the expert to
 * confirm first, which the interviewer's method allows (live, 2026-10-19).
 * `responses` is the relay's list. Returns the number of attempts used.
 */
export async function askUntilToolCall(page, responses, toolName, text, { tries = 3, timeout = 180000 } = {}) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    if (attempt > 1) await page.evaluate(() => window.__kg.agent.restartConversation());
    const before = responses.length;
    await sendChatMessage(page, text, { timeout });
    const made = responses.slice(before).some((r) => ((replyMessage(r) || {}).tool_calls || []).some((c) => c.function && c.function.name === toolName));
    if (made) return attempt;
  }
  return tries + 1;
}
