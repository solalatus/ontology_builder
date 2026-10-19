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
  CHAT_URL, MODELS_URL, forwardToRealOpenAi, connectAgentLive, openPanel, sendChatMessage,
  RATE_LIMIT_MAX_ATTEMPTS, sleepMs, isInsufficientQuotaError,
} from "./liveOpenAi.mjs";
import { forwardToRealAzure, connectAgentLiveAzure } from "./liveAzureOpenAi.mjs";
import { tpmBackoffMs, TPM_MAX_ATTEMPTS } from "../evals/lib/chatClient.mjs";
import { resolveLlmConfig, missingCredentials, defaultModel, llmEnv } from "./llmProvider.mjs";

export { openPanel, sendChatMessage, resolveLlmConfig, missingCredentials, defaultModel, llmEnv };

/** The URL pattern the app's chat calls go to, for the resolved provider. */
export function liveChatUrlPattern(config) {
  if (config.provider === "azure") return `${config.endpoint}/openai/deployments/**`;
  if (config.provider === "bedrock") return `${config.endpoint}/**/chat/completions`;
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
  return forwardToRealOpenAi(page, CHAT_URL);
}

async function selectModel(page, model) {
  const ids = await page.$$eval("#agent-model-select-modal option", (os) => os.map((o) => o.value));
  if (!ids.includes(model)) throw new Error(`model "${model}" is not offered for this key: ${ids.join(", ")}`);
  await page.selectOption("#agent-model-select-modal", model);
}

// The real connect flow against bedrock-mantle: configure the region (or
// endpoint override) in the Bedrock popup, list models, optionally pick one,
// finalise. Returns the relayed model-list responses.
export async function connectAgentLiveBedrock(page, config, { model = null } = {}) {
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
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}

/**
 * Connects the app to the resolved provider. `model` (optional) is picked
 * instead of the app's own default: a model id on OpenAI and Bedrock, a
 * deployment name on Azure.
 */
export async function connectAgentLiveProvider(page, config, { model = null } = {}) {
  if (config.provider === "azure") return connectAgentLiveAzure(page, config.apiKey, config.endpoint, { deployment: model });
  if (config.provider === "bedrock") return connectAgentLiveBedrock(page, config, { model });
  if (!model) return connectAgentLive(page, config.apiKey);
  const modelResponses = forwardToRealOpenAi(page, MODELS_URL);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", config.apiKey);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });
  await selectModel(page, model);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}
