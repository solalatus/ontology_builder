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

// Azure OpenAI meters a *tokens-per-minute* budget per deployment, not just a
// requests-per-second one. A judge call in this condition carries ~80k prompt
// tokens, so two of them back to back can exhaust a minute's budget outright,
// and the shared backoff (4 attempts, capped at 4s) cannot outlast a window
// that is measured in minutes. This is an extension of that shared policy, not
// a replacement: the imported constants still govern ordinary transient
// failures, and insufficient_quota is still never retried. A 429 that reports
// a Retry-After is honoured exactly; one that does not gets a minute-scale
// backoff, because that is the granularity the limit is actually enforced on.
export const TPM_MAX_ATTEMPTS = 6;
export function tpmBackoffMs(attempt, retryAfterSeconds) {
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) return Math.min(retryAfterSeconds * 1000 + 2000, 180000);
  return Math.min(30000 * attempt, 180000); // 30s, 60s, 90s, 120s, 150s
}

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

// Shared retry/request core for both call shapes below. Issue #133/Finding C
// (external audit): `chatOnce` only ever accepted a single system+user pair,
// so a caller with a real multi-turn conversation (personaAgent.mjs's own
// growing `messages` array) had no role-preserving option here and had to
// flatten every prior turn into one undifferentiated blob -- the exact
// pattern `cq-non-regression.mjs`'s own `azureChatMessages` was written to
// replace after it caused a persona to re-emit its scripted opening line on
// all 19 turns of a real run ("with no role boundaries, the strongest
// pattern left in the prompt is the persona document's own 'Opening
// response' section"). `chatMessagesOnce` below is that same fix, applied
// here instead of forking a second, weaker retry implementation: it gets
// this function's own TPM-aware backoff (`tpmBackoffMs`/`TPM_MAX_ATTEMPTS`,
// azureChatMessages only has the weaker `rateLimitBackoffMs`), which matters
// for a real multi-turn conversation -- by turn 200 the full transcript
// resent on every call is tens of thousands of tokens, exactly what this
// file's own header says can exhaust a minute's TPM budget outright.
async function requestOnce({ config, model, messages, label, url, headers, includeModelInBody, extraBody = {} }) {
  const body = { ...(includeModelInBody ? { model } : {}), messages, ...extraBody };
  const maxAttempts = Math.max(RATE_LIMIT_MAX_ATTEMPTS, TPM_MAX_ATTEMPTS);
  let res, data;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    const text = await res.text();
    try { data = JSON.parse(text); } catch (err) { data = { error: { message: text.slice(0, 500) } }; }
    if (res.ok) break;
    if (isInsufficientQuotaError(data) || attempt >= maxAttempts) {
      throw new Error(`${label}: chat call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
    }
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const waitMs = tpmBackoffMs(attempt, retryAfter);
      console.log(`  ${label}: rate limited (429), waiting ${Math.round(waitMs / 1000)}s before attempt ${attempt + 1}/${maxAttempts}`);
      await sleepMs(waitMs);
      continue;
    }
    if (res.status >= 500 && attempt < RATE_LIMIT_MAX_ATTEMPTS) { await sleepMs(rateLimitBackoffMs(attempt)); continue; }
    throw new Error(`${label}: chat call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
  }
  const choice = data.choices && data.choices[0];
  const reply = (choice && choice.message && choice.message.content) || "";
  return { data, choice, reply };
}

// Issue #133/E16 (external audit): a 200-OK-but-empty reply used to throw
// immediately with no retry at all -- distinct from the 429/5xx retry loop
// above, which only covers a failed HTTP response, not a "succeeded but
// said nothing" one. Reasoning-tier models genuinely do return empty
// content sometimes when the turn's token budget goes entirely to
// reasoning; a single retry of the exact same request absorbs that
// transient case for every caller uniformly, cheaper than pushing
// call-site-specific retry logic into each one. Still throws if the retry
// is ALSO empty -- an empty reply twice in a row from the same prompt is a
// real signal, not noise to paper over indefinitely.
async function chatRequest({ config, model, messages, label = "call", extraBody = {} }) {
  const { url, headers, includeModelInBody } = requestFor(config, model);
  let { data, choice, reply } = await requestOnce({ config, model, messages, label, url, headers, includeModelInBody, extraBody });
  if (!reply.trim()) {
    console.log(`  ${label}: provider returned an empty reply (finish_reason=${choice && choice.finish_reason}), retrying once`);
    ({ data, choice, reply } = await requestOnce({ config, model, messages, label, url, headers, includeModelInBody, extraBody }));
  }
  if (!reply.trim()) {
    throw new Error(`${label}: provider returned an empty reply twice in a row (finish_reason=${choice && choice.finish_reason})`);
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
      // Reported from extraBody, not hardcoded to null, since a caller can
      // opt in per call (conversationOrchestrator.mjs's classifier does,
      // having verified live that this specific deployment accepts both --
      // see that file's own header). Still null/not-sent by default for
      // every other caller (persona, review, judge): reasoning-tier models
      // in general can reject a non-default temperature or max_tokens
      // outright (HTTP 400, confirmed live -- see baseline-one-shot.mjs's
      // own request-body comment), so nothing here opts in without a
      // caller-specific, verified reason to.
      temperature: extraBody.temperature ?? null,
      maxTokens: null, // not sent -- reasoning-tier models reject max_tokens
    },
  };
}

// One chat completion from a system+user pair. Returns the reply text, the
// usage block, the model id the provider says answered, and the exact
// request parameters, so a caller can write all of it into provenance
// without reconstructing anything.
export async function chatOnce({ config, model, systemPrompt, userPrompt, label = "call", extraBody = {} }) {
  return chatRequest({ config, model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], label, extraBody });
}

// The same call, but for a real multi-turn conversation: `messages` is sent
// exactly as given, roles intact, no flattening. For a caller like
// personaAgent.mjs whose own `messages` array already accumulates the full
// system + user/assistant/user/... history turn by turn. `extraBody` is an
// opt-in escape hatch (e.g. { temperature: 0, response_format: { type:
// "json_object" } }) for a caller that has verified its own specific model
// accepts the extra fields -- never sent unless a caller asks for it.
export async function chatMessagesOnce({ config, model, messages, label = "call", extraBody = {} }) {
  return chatRequest({ config, model, messages, label, extraBody });
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
