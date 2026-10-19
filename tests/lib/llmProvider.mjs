// ONE PROVIDER CHOICE FOR EVERY NODE-SIDE MODEL CALL (issue #183)
//
// Every live test, eval and experiment script reads its provider, key,
// endpoint and default model from here, so switching between OpenAI, Azure
// OpenAI and AWS Bedrock is one change to the repo-root .env (or the real
// environment, which wins, same as tests/lib/env.mjs). The Python tools
// mirror this in ontology_translation/tools/env.py.
//
//   LLM_PROVIDER         openai | azure | bedrock. Optional: without it the
//                        provider follows the credentials present -- Azure
//                        if AZURE_OPENAI_ENDPOINT is set, else Bedrock if
//                        AWS_BEARER_TOKEN_BEDROCK is, else OpenAI. (The older
//                        EVAL_PROVIDER is still honoured.)
//   LLM_MODEL            the model for every role unless a script's own
//                        per-role variable says otherwise.
//   OpenAI:  OPENAI_API_KEY
//   Azure:   AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY,
//            AZURE_OPENAI_API_VERSION, AZURE_OPENAI_DEPLOYMENT
//   Bedrock: AWS_BEARER_TOKEN_BEDROCK (AWS's own name for a Bedrock API
//            key), AWS_REGION (default us-east-1), BEDROCK_ENDPOINT (an
//            optional bedrock-mantle host override), BEDROCK_MODEL
//
// Bedrock goes through bedrock-mantle, as the app does (index.html,
// bedrockChatPath and its neighbours): the same endpoint for the browser
// and for Node keeps the two paths comparable.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "..", "..", ".env");

export const PROVIDERS = ["openai", "azure", "bedrock"];
// Node-side Azure calls use this version (the app pins an older one only
// for its deployment-listing route; see AZURE_OPENAI_API_VERSION there).
export const DEFAULT_AZURE_API_VERSION = "2024-12-01-preview";
export const DEFAULT_BEDROCK_REGION = "us-east-1";

// Same parser as tests/lib/env.mjs, which reads one key at a time; this
// needs the whole set to decide the provider.
function parseEnvFile(filePath) {
  const out = {};
  let text;
  try { text = fs.readFileSync(filePath, "utf8"); } catch (err) { return out; }
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (key) out[key] = value;
  }
  return out;
}

/** The repo-root .env overlaid with the real environment's non-empty values. */
export function llmEnv({ envPath = ENV_PATH, processEnv = process.env } = {}) {
  const merged = parseEnvFile(envPath);
  for (const [k, v] of Object.entries(processEnv)) if (v) merged[k] = v;
  return merged;
}

export function resolveLlmProvider(env = llmEnv()) {
  const explicit = (env.LLM_PROVIDER || env.EVAL_PROVIDER || "").trim().toLowerCase();
  if (explicit) {
    if (!PROVIDERS.includes(explicit)) throw new Error(`LLM_PROVIDER must be one of ${PROVIDERS.join(", ")}; got "${explicit}"`);
    return explicit;
  }
  if (env.AZURE_OPENAI_ENDPOINT) return "azure";
  if (env.AWS_BEARER_TOKEN_BEDROCK) return "bedrock";
  return "openai";
}

export function bedrockMantleBaseUrl(region) {
  return `https://bedrock-mantle.${region}.api.aws`;
}

// A pasted ".../openai/v1" or ".../v1" base URL is trimmed to its host root;
// the path is chosen per model (bedrockChatPath).
export function normalizeBedrockEndpoint(raw) {
  const trimmed = (raw || "").trim().replace(/\/+$/, "").replace(/\/(openai\/)?v1$/, "").replace(/\/+$/, "");
  return trimmed || null;
}

/** Same rule as the app: closed-weight GPT models under /openai/v1, others under /v1. */
export function bedrockChatPath(model) {
  return /^openai\.gpt-(?!oss)/i.test(model) ? "/openai/v1" : "/v1";
}

/**
 * Everything a call needs, without the model. Missing values are null, not
 * errors, so a dry run can resolve a config without credentials; call
 * requireCredentials() at the point a real call is about to be made.
 */
export function resolveLlmConfig(env = llmEnv()) {
  const provider = resolveLlmProvider(env);
  if (provider === "azure") {
    return {
      provider,
      apiKey: env.AZURE_OPENAI_API_KEY || env.OPENAI_API_KEY || null,
      endpoint: (env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "") || null,
      apiVersion: env.AZURE_OPENAI_API_VERSION || DEFAULT_AZURE_API_VERSION,
      region: null,
    };
  }
  if (provider === "bedrock") {
    const region = env.AWS_REGION || env.AWS_DEFAULT_REGION || DEFAULT_BEDROCK_REGION;
    return {
      provider,
      apiKey: env.AWS_BEARER_TOKEN_BEDROCK || null,
      endpoint: normalizeBedrockEndpoint(env.BEDROCK_ENDPOINT) || bedrockMantleBaseUrl(region),
      apiVersion: null,
      region,
    };
  }
  return { provider, apiKey: env.OPENAI_API_KEY || null, endpoint: "https://api.openai.com", apiVersion: null, region: null };
}

const CREDENTIAL_NAMES = {
  openai: "OPENAI_API_KEY",
  azure: "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY",
  bedrock: "AWS_BEARER_TOKEN_BEDROCK",
};

/** Null when usable, else a sentence naming what to set (for skip messages). */
export function missingCredentials(config) {
  const ok = config.apiKey && config.endpoint;
  return ok ? null : `Set ${CREDENTIAL_NAMES[config.provider]} in the repo-root .env (see tests/README.md) to use ${config.provider}.`;
}

export function requireCredentials(config) {
  const missing = missingCredentials(config);
  if (missing) throw new Error(missing);
  return config;
}

/**
 * The model a script uses when nothing more specific is set: LLM_MODEL,
 * then the provider's own variable (AZURE_OPENAI_DEPLOYMENT is a deployment
 * name; BEDROCK_MODEL a Bedrock model id), then the script's own default,
 * an OpenAI model name translated to the provider's naming. On Azure that
 * translation is the identity: a deployment named after its model is the
 * convention this repository's runs have used, but nothing guarantees it.
 */
export function defaultModel(config, openAiName, env = llmEnv()) {
  if (env.LLM_MODEL) return env.LLM_MODEL;
  if (config.provider === "azure" && env.AZURE_OPENAI_DEPLOYMENT) return env.AZURE_OPENAI_DEPLOYMENT;
  if (config.provider === "bedrock" && env.BEDROCK_MODEL) return env.BEDROCK_MODEL;
  return modelIdFor(config, openAiName);
}

export function modelIdFor(config, openAiName) {
  if (!openAiName) return openAiName;
  // Already Bedrock-named: a vendor word ("openai.", "meta."), optionally
  // scoped ("us.openai."). The dot in "gpt-5.4" is not one.
  if (config.provider === "bedrock" && !/^([a-z]{2,6}(-gov)?\.)?[a-z]+\.[a-z]/i.test(openAiName)) return `openai.${openAiName}`;
  return openAiName;
}

/** URL, headers and body shape of one chat completion. */
export function chatRequestFor(config, model, bedrockPath = null) {
  if (config.provider === "azure") {
    return {
      // On Azure the "model" is a deployment name in the URL, and the
      // resolved model id only comes back in the response body.
      url: `${config.endpoint}/openai/deployments/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`,
      headers: { "api-key": config.apiKey, "Content-Type": "application/json" },
      includeModelInBody: false,
    };
  }
  if (config.provider === "bedrock") {
    return {
      url: `${config.endpoint}${bedrockPath || bedrockChatPath(model)}/chat/completions`,
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      includeModelInBody: true,
    };
  }
  return {
    url: `${config.endpoint}/v1/chat/completions`,
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    includeModelInBody: true,
  };
}

/** A wrong bedrock-mantle path prefix is answered with this message. */
export function isWrongBedrockRoute(status, data) {
  const message = (data && data.error && data.error.message) || "";
  return (status === 400 || status === 404) && /supported on this route/i.test(message);
}

/** What a provenance record says about the provider -- never the key. */
export function providerProvenance(config) {
  return {
    provider: config.provider,
    endpoint: config.endpoint,
    apiVersion: config.apiVersion,
    region: config.region,
  };
}

/**
 * The cheap, non-reasoning persona model the Azure-era experiments used
 * (issue #85 onwards), per provider. On Azure it is that resource's
 * deployment name for gpt-4o-mini. Bedrock offers no gpt-4o-mini, so the
 * persona runs on the interviewer's model there -- dearer, and a difference
 * a re-run on Bedrock must record rather than paper over.
 */
export function cheapPersonaModel(config, interviewerModel) {
  if (config.provider === "azure") return "gpt-4o-mini-internal";
  if (config.provider === "openai") return "gpt-4o-mini";
  return interviewerModel;
}
