import { openPanel, sendChatMessage, RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError } from "./liveOpenAi.mjs";
import { tpmBackoffMs, TPM_MAX_ATTEMPTS } from "../evals/lib/chatClient.mjs";

// Azure OpenAI counterpart to tests/lib/liveOpenAi.mjs -- reuses everything
// provider-agnostic from there (openPanel, sendChatMessage, the shared
// rate-limit backoff constants) and only re-implements the two things that
// are genuinely Azure-shaped: the relay (api-key header instead of
// Authorization: Bearer, a caller-supplied resource endpoint instead of a
// fixed api.openai.com URL) and the connect flow (fills in the endpoint
// field too). See tests/helper-agent-live-openai.spec.mjs's own file header
// for why every "live" test relays through Node's fetch() rather than
// letting headless Chromium dial out directly (it can't, in this sandbox).
export { RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError, openPanel, sendChatMessage };

// Relays the app's real outgoing request to the real Azure OpenAI resource
// and relays the real response back untouched (after retrying a transient
// 429, same reasoning as forwardToRealOpenAi). urlPattern is a Playwright
// glob/regex, not a fixed string, since the resource endpoint (and
// therefore the exact URL) is only known at test-run time from the
// environment, unlike OpenAI's single fixed api.openai.com URL.
//
// Issue #133/E5 (external audit): this used RATE_LIMIT_MAX_ATTEMPTS/
// rateLimitBackoffMs (1s/2s/4s, 4 attempts, ~7s total) -- the weakest retry
// of any real call site in this repo. chatClient.mjs's own header explains
// why that is not enough: Azure meters a *tokens-per-minute* budget, not
// just requests-per-second, and its own tpmBackoffMs/TPM_MAX_ATTEMPTS (30-
// 180s, 6 attempts, honouring Retry-After) is what every Node-side call
// already uses for exactly this reason. The app agent carries the largest
// prompts of any call site (the growing transcript plus tool schemas), so
// it is the *most* likely to hit a TPM window, and until now it was the one
// path with no way to wait one out -- it would simply fulfil the 429 into
// the app, which conversationOrchestrator.mjs's own classifyAppSystemNote
// (issue #133/E4) now at least counts rather than silently misreading as
// the app agent going quiet, but "count the failure" is a worse outcome
// than "survive the transient window," which this fix makes possible.
export function forwardToRealAzure(page, urlPattern) {
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
          // Azure's key-based auth is the `api-key` header, not
          // `Authorization: Bearer` -- forwarding the real header the app
          // itself sent (not re-deriving it) is what proves the app's own
          // header-selection code is what's under test here, not this relay.
          headers: { "api-key": req.headers()["api-key"], "Content-Type": "application/json" },
          body: req.postData(),
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
      const retryAfter = Number(res.headers.get("retry-after"));
      await sleepMs(tpmBackoffMs(attempt, retryAfter));
    }
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (err) { /* non-JSON body, leave parsed null */ }
    // `retries` travels with each completed response so a caller building
    // operational stats (reportGenerator.mjs's computeOperationalStats) can
    // surface how many 429s the app agent's own calls actually absorbed,
    // the same visibility issue #133/E4 gave the Node-side calls.
    responses.push({ status: res.status, body: parsed, retries });
    await route.fulfill({ status: res.status, contentType: "application/json", body: text });
  });
  return responses;
}

// The endpoint field lives in its own popup now, reached via the small
// #agent-azure-config-open link/summary button in the main connect modal
// (design critique, 2026-08) -- not inline anymore. Opens the popup, fills
// the endpoint, and Saves (which returns to the main modal).
export async function configureAzureEndpoint(page, endpoint) {
  await page.click("#agent-azure-config-open");
  await page.fill("#agent-azure-endpoint-input", endpoint);
  await page.click("#agent-azure-config-save");
}

// Drives the real connect flow with a real Azure key + endpoint: real GET
// .../openai/deployments (relayed, see forwardToRealAzure above), real
// default-deployment selection against the real returned list, then
// finalizes. Returns the real deployment-list responses.
export async function connectAgentLiveAzure(page, apiKey, endpoint) {
  const deploymentsUrl = `${endpoint.replace(/\/+$/, "")}/openai/deployments**`;
  const modelResponses = forwardToRealAzure(page, deploymentsUrl);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", apiKey);
  await configureAzureEndpoint(page, endpoint);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}
