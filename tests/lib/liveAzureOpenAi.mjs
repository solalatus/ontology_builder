import { openPanel, sendChatMessage, RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError } from "./liveOpenAi.mjs";

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
export function forwardToRealAzure(page, urlPattern) {
  const responses = [];
  page.route(urlPattern, async (route) => {
    const req = route.request();
    let res, text;
    for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
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
      if (res.status !== 429 || attempt >= RATE_LIMIT_MAX_ATTEMPTS) break;
      let parsedErr = null;
      try { parsedErr = JSON.parse(text); } catch (err) { /* non-JSON error body */ }
      if (isInsufficientQuotaError(parsedErr)) break;
      await sleepMs(rateLimitBackoffMs(attempt));
    }
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (err) { /* non-JSON body, leave parsed null */ }
    responses.push({ status: res.status, body: parsed });
    await route.fulfill({ status: res.status, contentType: "application/json", body: text });
  });
  return responses;
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
  await page.fill("#agent-azure-endpoint-input", endpoint);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 30000 });
  return modelResponses;
}
