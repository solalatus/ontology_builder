// PROVIDER-AGNOSTIC CHAT CALL FOR THE OFFLINE EVAL SCRIPTS
//
// A single `chatOnce()` that talks to either OpenAI or Azure OpenAI, so a
// condition can be re-run against whichever endpoint the person reproducing it
// actually has. The anchor runs (results/runs/) were produced against OpenAI;
// the post-normalization condition was produced against Azure OpenAI, because
// that is the only endpoint the model family was reachable on at the time (see
// POST_NORMALIZATION.md §2, "Deviations from the brief"). Nothing else about a
// condition should depend on which of the two answered.
//
// Retry/backoff is imported, never re-implemented (EXPERIMENT_BRIEF.md §4.7):
// the same RATE_LIMIT_MAX_ATTEMPTS / rateLimitBackoffMs every other real API
// call site in this repository uses, and the same refusal to retry a permanent
// insufficient_quota. There is no silent fallback and no swallowed failure --
// a call that cannot be completed throws with the provider's own status and
// message attached.
//
// Deliberately sends no `temperature`. The interviewer-tier models this
// condition runs on are reasoning-tier and reject a non-default temperature
// outright (HTTP 400, confirmed live -- see baseline-one-shot.mjs's own
// request-body comment). Omitting it is the one request shape that works
// across standard and reasoning-tier models alike, so the provenance records
// `temperature: null` meaning "not sent", not "sent as zero".
import {
  RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError,
} from "../../lib/liveOpenAi.mjs";

export const DEFAULT_AZURE_API_VERSION = "2024-12-01-preview";

// Resolves the provider from the environment. Azure wins when an endpoint is
// configured, because supplying one is an explicit choice; otherwise OpenAI.
export function resolveProvider(env = process.env) {
  const explicit = (env.EVAL_PROVIDER || "").toLowerCase();
  if (explicit === "azure" || explicit === "openai") return explicit;
  return env.AZURE_OPENAI_ENDPOINT ? "azure" : "openai";
}

export function resolveClientConfig(env = process.env) {
  const provider = resolveProvider(env);
  if (provider === "azure") {
    const endpoint = (env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
    const apiKey = env.AZURE_OPENAI_API_KEY || env.OPENAI_API_KEY;
    const apiVersion = env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION;
    if (!endpoint) throw new Error("AZURE_OPENAI_ENDPOINT is not set");
    if (!apiKey) throw new Error("AZURE_OPENAI_API_KEY (or OPENAI_API_KEY) is not set");
    return { provider, endpoint, apiKey, apiVersion };
  }
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return { provider, apiKey, endpoint: "https://api.openai.com", apiVersion: null };
}

function requestFor(config, model) {
  if (config.provider === "azure") {
    return {
      // On Azure the "model" is a deployment name in the URL, and the resolved
      // model id only comes back in the response body -- which is why every
      // artifact records both `model` (what was asked for) and `modelReported`
      // (what actually answered). They are not always the same string.
      url: `${config.endpoint}/openai/deployments/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`,
      headers: { "api-key": config.apiKey, "Content-Type": "application/json" },
      includeModelInBody: false,
    };
  }
  return {
    url: `${config.endpoint}/v1/chat/completions`,
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    includeModelInBody: true,
  };
}

// One chat completion. Returns the reply text, the usage block, the model id
// the provider says answered, and the exact request parameters, so a caller can
// write all of it into provenance without reconstructing anything.
export async function chatOnce({ config, model, systemPrompt, userPrompt, label = "call" }) {
  const { url, headers, includeModelInBody } = requestFor(config, model);
  const body = {
    ...(includeModelInBody ? { model } : {}),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  let res, data;
  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const text = await res.text();
    try { data = JSON.parse(text); } catch (err) { data = { error: { message: text.slice(0, 500) } }; }
    if (res.ok) break;
    const retryable = (res.status === 429 || res.status >= 500) && attempt < RATE_LIMIT_MAX_ATTEMPTS && !isInsufficientQuotaError(data);
    if (retryable) { await sleepMs(rateLimitBackoffMs(attempt)); continue; }
    throw new Error(`${label}: chat call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
  }

  const choice = data.choices && data.choices[0];
  const reply = (choice && choice.message && choice.message.content) || "";
  if (!reply.trim()) {
    throw new Error(`${label}: provider returned an empty reply (finish_reason=${choice && choice.finish_reason})`);
  }
  return {
    reply,
    usage: data.usage || null,
    modelReported: data.model || null,
    finishReason: (choice && choice.finish_reason) || null,
    requestParams: {
      provider: config.provider,
      endpoint: config.provider === "azure" ? config.endpoint : "https://api.openai.com",
      apiVersion: config.apiVersion,
      model,
      temperature: null, // not sent -- see this file's header
      maxTokens: null,   // not sent -- reasoning-tier models reject max_tokens
    },
  };
}

export function sumUsage(usages) {
  const total = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, calls: 0 };
  for (const u of usages) {
    if (!u) continue;
    total.prompt_tokens += u.prompt_tokens || 0;
    total.completion_tokens += u.completion_tokens || 0;
    total.total_tokens += u.total_tokens || 0;
    total.calls += 1;
  }
  return total;
}
