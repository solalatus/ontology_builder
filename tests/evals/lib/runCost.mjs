// Token and cost accounting for one benchmark run (issue #182). Both sides
// of a run are counted: the app's own calls, read from the app's usage log
// (window.__kg.agent.state.usage -- already normalized to Chat Completions
// field names whichever API answered, cached tokens included), and the
// harness's calls (persona, classifier, review, judge), whose usage blocks
// chatMessagesOnce returns as the provider sent them.
//
// Prices are per million tokens and come from the environment, so a run on
// another model or price list does not need a code change; the defaults are
// the Azure Global Standard list prices for gpt-6-sol as of 2026-10
// (uncached input 2.00, cached input 0.20, output 10.00). Reasoning tokens
// are part of completion_tokens and billed as output.

export const DEFAULT_PRICES_PER_MILLION = { input: 2.0, cachedInput: 0.2, output: 10.0 };

export function pricesFromEnv(env = process.env) {
  const num = (v, d) => (v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    input: num(env.EVAL_PRICE_INPUT_PER_M, DEFAULT_PRICES_PER_MILLION.input),
    cachedInput: num(env.EVAL_PRICE_CACHED_INPUT_PER_M, DEFAULT_PRICES_PER_MILLION.cachedInput),
    output: num(env.EVAL_PRICE_OUTPUT_PER_M, DEFAULT_PRICES_PER_MILLION.output),
  };
}

// One usage block, either shape: Chat Completions (prompt_tokens,
// prompt_tokens_details.cached_tokens) or Responses (input_tokens,
// input_tokens_details.cached_tokens).
export function normalizeUsage(u) {
  if (!u || typeof u !== "object") return null;
  const prompt = u.prompt_tokens ?? u.input_tokens ?? 0;
  const completion = u.completion_tokens ?? u.output_tokens ?? 0;
  const cached = (u.prompt_tokens_details || u.input_tokens_details || {}).cached_tokens || 0;
  const reasoning = (u.completion_tokens_details || u.output_tokens_details || {}).reasoning_tokens || 0;
  return { prompt, completion, cached, reasoning };
}

export function summarizeUsage(usages, prices = DEFAULT_PRICES_PER_MILLION) {
  const total = { calls: 0, promptTokens: 0, cachedTokens: 0, completionTokens: 0, reasoningTokens: 0 };
  for (const raw of usages) {
    const u = normalizeUsage(raw);
    if (!u) continue;
    total.calls++;
    total.promptTokens += u.prompt;
    total.cachedTokens += u.cached;
    total.completionTokens += u.completion;
    total.reasoningTokens += u.reasoning;
  }
  const uncached = Math.max(0, total.promptTokens - total.cachedTokens);
  total.cachedShare = total.promptTokens ? total.cachedTokens / total.promptTokens : null;
  total.costUsd = (uncached * prices.input + total.cachedTokens * prices.cachedInput + total.completionTokens * prices.output) / 1e6;
  return total;
}

// The app's usage log, split by kind (interview, consistency_llm, ...).
export function summarizeAppUsageLog(entries, prices = DEFAULT_PRICES_PER_MILLION) {
  const byKind = {};
  for (const e of entries || []) {
    const kind = (e && e.kind) || "unknown";
    (byKind[kind] = byKind[kind] || []).push(e && e.usage);
  }
  return {
    all: summarizeUsage((entries || []).map((e) => e && e.usage), prices),
    byKind: Object.fromEntries(Object.entries(byKind).map(([k, us]) => [k, summarizeUsage(us, prices)])),
  };
}

export function runCost({ appUsageLog = [], harnessUsages = [], prices = DEFAULT_PRICES_PER_MILLION }) {
  const app = summarizeAppUsageLog(appUsageLog, prices);
  const harness = summarizeUsage(harnessUsages, prices);
  const all = summarizeUsage([...(appUsageLog || []).map((e) => e && e.usage), ...harnessUsages], prices);
  return { prices, app: app.all, appByKind: app.byKind, harness, all };
}
