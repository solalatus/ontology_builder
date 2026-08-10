import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Helper Agent — Azure OpenAI support. Azure OpenAI isn't a drop-in swap
// for OpenAI's API: the endpoint is resource-specific (not a fixed global
// URL), auth is a plain `api-key` header rather than `Authorization:
// Bearer`, every request needs an explicit `api-version` query param
// (OpenAI has no equivalent), models are addressed by an
// arbitrary user-chosen *deployment* name via the URL path rather than a
// `model` field in the body, and the deployment-list response shapes each
// entry differently from OpenAI's /v1/models (id = deployment name, model
// = the actual underlying model the reasoning/chat-model heuristics need
// to look at instead). Every one of those differences is a place a naive
// "just reuse the OpenAI code path" implementation would silently send a
// malformed or misrouted request, or pick the wrong default model — this
// file exists to pin each of them individually, not just the happy path.
//
// Entering an endpoint is the ONLY signal that switches provider (see
// isAzureProvider()'s own comment in index.html) — leaving it blank must
// reproduce today's exact OpenAI behavior, which every *other*
// helper-agent-*.spec.mjs file already proves by continuing to pass
// unmodified against this same code.
//
// Fully mocked via page.route() — no real network, no API key or endpoint
// needed, deterministic in CI. See tests/helper-agent-live-azure.spec.mjs
// for the real-Azure-resource counterpart (opt-in, skipped unless a real
// Azure key + endpoint are configured).

const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const AZURE_ENDPOINT = "https://test-resource.openai.azure.com";
const AZURE_API_VERSION = "2024-10-21"; // must track AZURE_OPENAI_API_VERSION in index.html
const AZURE_DEPLOYMENTS_URL = `${AZURE_ENDPOINT}/openai/deployments?api-version=${AZURE_API_VERSION}`;
const AZURE_CHAT_URL_PREFIX = `${AZURE_ENDPOINT}/openai/deployments/`;

function azureChatUrl(deploymentId) {
  return `${AZURE_ENDPOINT}/openai/deployments/${deploymentId}/chat/completions?api-version=${AZURE_API_VERSION}`;
}

function mockOpenAiModelsRoute(page, { status = 200, models = null } = {}) {
  return page.route(OPENAI_MODELS_URL, (route) => {
    if (status !== 200) {
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: { message: "mocked failure" } }) });
      return;
    }
    const data = (models || [{ id: "gpt-4o-mini", created: 1715000000 }])
      .map((m) => ({ id: m.id, object: "model", created: m.created, owned_by: "openai" }));
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data }) });
  });
}

// Azure's deployment-list response: {data: [{id, model, status, created_at, ...}]}.
function mockAzureDeploymentsRoute(page, { status = 200, deployments = null } = {}) {
  const requests = [];
  page.route(AZURE_DEPLOYMENTS_URL, (route) => {
    requests.push({ headers: route.request().headers() });
    if (status !== 200) {
      route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ error: { message: "mocked failure" } }) });
      return;
    }
    const data = (deployments || [{ id: "test-deployment", model: "gpt-4o-mini", created_at: 1715000000, status: "succeeded" }]);
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data }) });
  });
  return requests;
}

function chatCompletionBody(replyText) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: replyText }, finish_reason: "stop" }] };
}

function toolCall(id, argsObj) {
  return { id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify(argsObj) } };
}

function toolCallCompletionBody(toolCalls, content = null) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content, tool_calls: toolCalls }, finish_reason: "tool_calls" }] };
}

// Mirrors every other helper-agent-*.spec.mjs's own withPageAllowingResourceErrors:
// tolerates the one console message Chromium logs for a real, non-2xx or
// aborted fetch() ("Failed to load resource: ...") -- needed by the tests
// below that deliberately mock a 401/network failure.
async function withPageAllowingResourceErrors(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  const unexpected = consoleErrors.filter((m) => !/Failed to load resource/.test(m));
  assert.deepEqual(unexpected, [], "expected no console/page errors other than the mocked fetch failure's own resource-load log");
}

async function openPanel(page) {
  const expanded = await page.evaluate(() => window.__kg.agent.isExpanded());
  if (!expanded) await page.click("#agent-panel-toggle");
}

// The endpoint (and, optionally, api-version) fields live in their own
// popup, reached via the small #agent-azure-config-open link/summary button
// in the main connect modal (design critique, 2026-08) -- not inline
// anymore. Opens the popup, fills it, and Saves (which returns to the main
// modal with the summary/key-label updated).
async function configureAzure(page, endpoint, apiVersion = "") {
  await page.click("#agent-azure-config-open");
  await page.fill("#agent-azure-endpoint-input", endpoint);
  if (apiVersion) await page.fill("#agent-azure-api-version-input", apiVersion);
  await page.click("#agent-azure-config-save");
}

// Drives the connect flow with an optional Azure endpoint -- blank
// (default) reproduces the plain-OpenAI flow every other spec file uses.
async function connectAgent(page, { key = "sk-test-key", azureEndpoint = "", azureApiVersion = "" } = {}) {
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", key);
  if (azureEndpoint) await configureAzure(page, azureEndpoint, azureApiVersion);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

async function sendChatMessage(page, text) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
}

// --------------------------------------------------------------------------
// Pure helper functions -- URL building, header building, validation
// --------------------------------------------------------------------------

test("isAzureProvider is true only for a non-empty endpoint", async () => {
  await withPage(async (page) => {
    const results = await page.evaluate(() => [
      window.__kg.agent.isAzureProvider(null),
      window.__kg.agent.isAzureProvider(""),
      window.__kg.agent.isAzureProvider("https://x.openai.azure.com"),
    ]);
    assert.deepEqual(results, [false, false, true]);
  });
});

test("normalizeAzureEndpoint trims whitespace and a trailing slash, and returns null for blank input", async () => {
  await withPage(async (page) => {
    const results = await page.evaluate(() => [
      window.__kg.agent.normalizeAzureEndpoint("  https://foo.openai.azure.com/  "),
      window.__kg.agent.normalizeAzureEndpoint("https://foo.openai.azure.com///"),
      window.__kg.agent.normalizeAzureEndpoint(""),
      window.__kg.agent.normalizeAzureEndpoint("   "),
      window.__kg.agent.normalizeAzureEndpoint(null),
    ]);
    assert.deepEqual(results, [
      "https://foo.openai.azure.com",
      "https://foo.openai.azure.com",
      null,
      null,
      null,
    ]);
  });
});

test("isValidAzureEndpoint accepts absolute http(s) URLs and rejects everything else", async () => {
  await withPage(async (page) => {
    const results = await page.evaluate(() => [
      window.__kg.agent.isValidAzureEndpoint("https://foo.openai.azure.com"),
      window.__kg.agent.isValidAzureEndpoint("http://localhost:8080"),
      window.__kg.agent.isValidAzureEndpoint("not-a-url"),
      window.__kg.agent.isValidAzureEndpoint("ftp://foo.openai.azure.com"),
      window.__kg.agent.isValidAzureEndpoint(""),
      window.__kg.agent.isValidAzureEndpoint("javascript:alert(1)"),
    ]);
    assert.deepEqual(results, [true, true, false, false, false, false]);
  });
});

test("modelsUrl/chatUrl/authHeaders return the OpenAI shape for a null endpoint and the Azure shape for a real one", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(({ endpoint, version }) => ({
      openaiModelsUrl: window.__kg.agent.modelsUrl(null),
      openaiChatUrl: window.__kg.agent.chatUrl(null, "gpt-4o"),
      openaiHeaders: window.__kg.agent.authHeaders(null, "sk-abc"),
      azureModelsUrl: window.__kg.agent.modelsUrl(endpoint),
      azureChatUrl: window.__kg.agent.chatUrl(endpoint, "my-deployment"),
      azureHeaders: window.__kg.agent.authHeaders(endpoint, "azure-key-abc"),
      azureChatUrlEncodesDeploymentName: window.__kg.agent.chatUrl(endpoint, "my deployment/weird"),
      version,
    }), { endpoint: AZURE_ENDPOINT, version: AZURE_API_VERSION });

    assert.equal(result.openaiModelsUrl, "https://api.openai.com/v1/models");
    assert.equal(result.openaiChatUrl, "https://api.openai.com/v1/chat/completions");
    assert.deepEqual(result.openaiHeaders, { Authorization: "Bearer sk-abc" });

    assert.equal(result.azureModelsUrl, `${AZURE_ENDPOINT}/openai/deployments?api-version=${result.version}`);
    assert.equal(result.azureChatUrl, `${AZURE_ENDPOINT}/openai/deployments/my-deployment/chat/completions?api-version=${result.version}`);
    assert.deepEqual(result.azureHeaders, { "api-key": "azure-key-abc" });
    // A deployment name with characters that would otherwise corrupt the URL
    // path must come back safely encoded, not spliced in raw.
    assert.ok(!result.azureChatUrlEncodesDeploymentName.includes(" "));
    assert.ok(result.azureChatUrlEncodesDeploymentName.includes(encodeURIComponent("my deployment/weird")));
  });
});

test("the app's own AZURE_OPENAI_API_VERSION matches what this test file assumes", async () => {
  // A drifted constant here wouldn't fail loudly elsewhere -- every mocked
  // route below matches on AZURE_API_VERSION, so a real-code bump that
  // forgot to update this file would make every other test in it silently
  // stop testing what it claims to.
  await withPage(async (page) => {
    const version = await page.evaluate(() => window.__kg.agent.azureApiVersion);
    assert.equal(version, AZURE_API_VERSION);
  });
});

// --------------------------------------------------------------------------
// Connect modal UI
// --------------------------------------------------------------------------

test("the connect modal's default flow shows only the key field, with a small link to a separate Azure config popup", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    assert.ok(await page.locator("#agent-key-input").isVisible());
    assert.ok(await page.locator("#agent-azure-config-open").isVisible(), "expected a small link/button to the Azure config popup");
    assert.equal(await page.locator("#agent-azure-endpoint-input").isVisible(), false, "the endpoint field must not be inline in the main modal");
  });
});

test("the Azure link opens a dedicated popup with the endpoint field and explanatory hint text", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.click("#agent-azure-config-open");
    assert.ok(await page.locator("#agent-azure-config-overlay").isVisible());
    assert.equal(await page.locator("#agent-connect-overlay").isVisible(), false, "opening the popup should hide the main connect modal, not stack on top of it");
    assert.ok(await page.locator("#agent-azure-endpoint-input").isVisible());
    const label = await page.locator("#agent-azure-endpoint-label").textContent();
    assert.match(label, /Azure/i);
    const hint = await page.locator("#agent-azure-endpoint-hint").textContent();
    assert.match(hint, /OpenAI/i);
    assert.match(hint, /Azure/i);
    // Endpoint isn't a secret the way the key is -- must not be masked.
    assert.equal(await page.locator("#agent-azure-endpoint-input").getAttribute("type"), "text");
  });
});

test("the popup also has an editable, optional API-version field", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.click("#agent-azure-config-open");
    assert.ok(await page.locator("#agent-azure-api-version-input").isVisible());
    const hint = await page.locator("#agent-azure-api-version-hint").textContent();
    assert.ok(hint.length > 0);
  });
});

test("Cancel in the popup discards unsaved edits and returns to the main modal", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", AZURE_ENDPOINT);
    await page.click("#agent-azure-config-cancel");
    assert.ok(await page.locator("#agent-connect-overlay").isVisible());
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureEndpoint()), null);
    const linkText = await page.locator("#agent-azure-config-open").textContent();
    assert.doesNotMatch(linkText, new RegExp(AZURE_ENDPOINT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("Save in the popup persists the pending endpoint and shows it in the main modal's summary", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await configureAzure(page, AZURE_ENDPOINT);
    assert.ok(await page.locator("#agent-connect-overlay").isVisible());
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureEndpoint()), AZURE_ENDPOINT);
    const linkText = await page.locator("#agent-azure-config-open").textContent();
    assert.match(linkText, /openai\.azure\.com/i);
  });
});

test("Remove in the popup clears a configured endpoint and reverts the summary to the plain link", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-azure-config-open");
    await page.click("#agent-azure-config-remove");
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureEndpoint()), null);
    const linkText = await page.locator("#agent-azure-config-open").textContent();
    assert.doesNotMatch(linkText, /openai\.azure\.com/i);
  });
});

test("the key label reads plainly as OpenAI by default, and switches to Azure OpenAI once an endpoint is configured", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    const defaultLabel = await page.locator("#agent-key-label").textContent();
    assert.match(defaultLabel, /OpenAI/i);
    assert.doesNotMatch(defaultLabel, /Azure/i);

    await configureAzure(page, AZURE_ENDPOINT);
    const azureLabel = await page.locator("#agent-key-label").textContent();
    assert.match(azureLabel, /Azure/i);
  });
});

// --------------------------------------------------------------------------
// Leaving the endpoint blank reproduces today's exact OpenAI behavior
// --------------------------------------------------------------------------

test("leaving the Azure endpoint field blank connects via plain OpenAI, unchanged", async () => {
  await withPage(async (page) => {
    await mockOpenAiModelsRoute(page);
    await connectAgent(page); // azureEndpoint defaults to ""
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureEndpoint), null);
    assert.equal(await page.evaluate(() => window.__kg.agent.isAzureProvider(window.__kg.agent.state.azureEndpoint)), false);
  });
});

// --------------------------------------------------------------------------
// Filling in the endpoint switches to Azure -- model discovery
// --------------------------------------------------------------------------

test("an Azure endpoint routes model discovery to the deployments endpoint with an api-key header, not Authorization", async () => {
  await withPage(async (page) => {
    const requests = mockAzureDeploymentsRoute(page);
    await connectAgent(page, { key: "azure-secret-key", azureEndpoint: AZURE_ENDPOINT });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].headers["api-key"], "azure-secret-key");
    assert.equal(requests[0].headers["authorization"], undefined, "Azure key-based auth must never also send a Bearer Authorization header");
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureEndpoint), AZURE_ENDPOINT);
  });
});

test("a trailing slash on the typed endpoint doesn't produce a double slash in the real request URL", async () => {
  await withPage(async (page) => {
    let requestedUrl = null;
    page.route(AZURE_DEPLOYMENTS_URL, (route) => {
      requestedUrl = route.request().url();
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: [{ id: "d1", model: "gpt-4o-mini", created_at: 1, status: "succeeded" }] }) });
    });
    await connectAgent(page, { azureEndpoint: `${AZURE_ENDPOINT}/` });
    assert.equal(requestedUrl, AZURE_DEPLOYMENTS_URL);
    assert.ok(!requestedUrl.includes("azure.com//openai"), `unexpected double slash in ${requestedUrl}`);
  });
});

test("the deployment list populates the model select with deployment names, not base model names", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [
        { id: "my-prod-chat", model: "gpt-4o-mini", created_at: 1715000000, status: "succeeded" },
      ],
    });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "azure-key");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    const options = await page.locator("#agent-model-select-modal option").allTextContents();
    assert.ok(options.some((o) => o.includes("my-prod-chat")), `expected the deployment name in the option list, got: ${options}`);
    assert.ok(!options.some((o) => o === "gpt-4o-mini"), "the base model name alone should not appear as a selectable option");
  });
});

test("a deployment whose arbitrary name doesn't look like a model id is still correctly identified as reasoning-capable via its base model", async () => {
  // The exact bug class this whole feature has to avoid: a deployment named
  // "team-alpha-endpoint" running gpt-5.5 must still be preferred as the
  // default over a deployment named "gpt-5-mini-official" that's actually
  // running the -mini tier -- proving the heuristic reads baseModel, not id.
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [
        { id: "gpt-5-mini-official", model: "gpt-5-mini", created_at: 100, status: "succeeded" },
        { id: "team-alpha-endpoint", model: "gpt-5.5", created_at: 100, status: "succeeded" },
      ],
    });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "azure-key");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    const selected = await page.locator("#agent-model-select-modal").inputValue();
    assert.equal(selected, "team-alpha-endpoint", "the standard-tier reasoning model's deployment should be preferred by name, regardless of the arbitrary deployment id");
  });
});

test("a deployment with a failed/canceled status is excluded from the list", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [
        { id: "broken-deployment", model: "gpt-4o", created_at: 100, status: "failed" },
        { id: "working-deployment", model: "gpt-4o", created_at: 100, status: "succeeded" },
      ],
    });
    await connectAgent(page, { azureEndpoint: AZURE_ENDPOINT });
    const models = await page.evaluate(() => window.__kg.agent.state.models.map((m) => m.id));
    assert.deepEqual(models, ["working-deployment"]);
  });
});

test("an unfamiliar/unrecognized status string on a deployment is not treated as a failure -- it stays selectable", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [{ id: "future-status-deployment", model: "gpt-4o", created_at: 100, status: "provisioning-v2" }],
    });
    await connectAgent(page, { azureEndpoint: AZURE_ENDPOINT });
    const models = await page.evaluate(() => window.__kg.agent.state.models.map((m) => m.id));
    assert.deepEqual(models, ["future-status-deployment"]);
  });
});

// --------------------------------------------------------------------------
// Validation and errors
// --------------------------------------------------------------------------

test("an invalid-looking endpoint is rejected at Save time in the popup itself, before it ever reaches the connect flow", async () => {
  await withPage(async (page) => {
    let fetchAttempted = false;
    await page.route("**/*", (route) => {
      if (route.request().url().includes("not-a-real-endpoint")) fetchAttempted = true;
      route.continue();
    });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", "not-a-real-endpoint");
    await page.click("#agent-azure-config-save");
    await page.waitForFunction(() => window.__kg.agent.getAzureConfigErrorKind() === "invalidEndpoint");
    const errorText = await page.textContent("#agent-azure-config-error");
    assert.match(errorText, /valid|endpoint|url/i);
    // Save should refuse and keep the popup open, not silently fall back to
    // the main modal with a bad value pending.
    assert.ok(await page.locator("#agent-azure-config-overlay").isVisible());
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureEndpoint()), null);
    assert.equal(fetchAttempted, false, "a malformed endpoint should be rejected before any network call");
  });
});

test("a malformed endpoint left over in storage (e.g. from an older version) is still caught defensively on Connect", async () => {
  // Save's own validation (above) means a real user can never get a bad
  // endpoint into agentConnectAzureEndpoint through the UI -- but
  // openAgentConnectModal() also loads a remembered endpoint straight from
  // localStorage without re-running that check, so submitAgentConnect()
  // keeps its own defensive validation too. This pins that fallback path.
  await withPage(async (page) => {
    let fetchAttempted = false;
    await page.route("**/*", (route) => {
      if (route.request().url().includes("not-a-real-endpoint")) fetchAttempted = true;
      route.continue();
    });
    await page.evaluate(() => localStorage.setItem("kg-agent-azure-endpoint", "not-a-real-endpoint"));
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "invalidEndpoint");
    const errorText = await page.textContent("#agent-connect-error");
    assert.match(errorText, /valid|endpoint|url/i);
    assert.equal(fetchAttempted, false, "a malformed endpoint should be rejected before any network call");
  });
});

test("an invalid Azure key surfaces the same inline error as an invalid OpenAI key", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockAzureDeploymentsRoute(page, { status: 401 });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "bad-azure-key");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "invalidKey");
    assert.equal(await page.evaluate(() => window.__kg.agent.state.connected), false);
  });
});

test("a 403 on the deployments endpoint is also treated as an invalid-key error", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockAzureDeploymentsRoute(page, { status: 403 });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "forbidden-key");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "invalidKey");
  });
});

// --------------------------------------------------------------------------
// Chat completions: URL, headers, and body shape
// --------------------------------------------------------------------------

test("a chat turn against Azure posts to the deployment-scoped URL with an api-key header and no model/prompt_cache_key field", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [{ id: "my-deployment", model: "gpt-4o-mini", created_at: 1, status: "succeeded" }],
    });
    await connectAgent(page, { key: "azure-secret", azureEndpoint: AZURE_ENDPOINT });

    let capturedRequest = null;
    await page.route(azureChatUrl("my-deployment"), (route) => {
      capturedRequest = { headers: route.request().headers(), body: route.request().postDataJSON() };
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(chatCompletionBody("hello back")) });
    });

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    assert.ok(capturedRequest, "expected a request to the deployment-scoped chat URL");
    assert.equal(capturedRequest.headers["api-key"], "azure-secret");
    assert.equal(capturedRequest.headers["authorization"], undefined);
    assert.equal(capturedRequest.body.model, undefined, "Azure addresses the model via the URL, not a body field");
    assert.equal(capturedRequest.body.prompt_cache_key, undefined, "prompt_cache_key is an OpenAI-only hint with no verified Azure equivalent");
    assert.ok(Array.isArray(capturedRequest.body.messages) && capturedRequest.body.messages.length > 0);
    // Tools are always attached on a real chat turn (apply_ontology_yaml +
    // get_graph_state) -- this is the exact request shape a real tool-calling
    // turn depends on, so it must survive the Azure code path unchanged.
    assert.ok(Array.isArray(capturedRequest.body.tools) && capturedRequest.body.tools.length > 0);
    assert.equal(capturedRequest.body.tool_choice, "auto");

    const last = await page.evaluate(() => {
      const t = window.__kg.agent.state.transcript;
      return t[t.length - 1];
    });
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "hello back");
  });
});

test("a real tool call against Azure still applies to the canvas through the real import pipeline", async () => {
  // The single highest-risk regression for this whole feature: proving
  // apply_ontology_yaml's tool-calling round trip is byte-identical in
  // outcome whether the underlying provider is OpenAI or Azure.
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [{ id: "tool-deployment", model: "gpt-4o-mini", created_at: 1, status: "succeeded" }],
    });
    await connectAgent(page, { azureEndpoint: AZURE_ENDPOINT });

    const chatUrl = azureChatUrl("tool-deployment");
    const requestBodies = [];
    let callIndex = 0;
    const responders = [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A request for payment.\n" })]) }),
      () => ({ body: chatCompletionBody("Added the Invoice class.") }),
    ];
    await page.route(chatUrl, (route) => {
      requestBodies.push(route.request().postDataJSON());
      const { body } = responders[Math.min(callIndex, responders.length - 1)]();
      callIndex++;
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
    });

    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    await sendChatMessage(page, "Let's track invoices.");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Invoice"), "the tool call should have committed the Invoice class through the real import pipeline");
    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter - historyBefore, 1, "the whole turn must still cost exactly one undo step under Azure, same as OpenAI");
    assert.equal(requestBodies.length, 2, "expected the tool-call turn plus the follow-up reply turn");
    for (const body of requestBodies) assert.equal(body.model, undefined);
  });
});

test("a 429 rate limit against Azure retries with backoff the same way OpenAI does", async () => {
  // withPageAllowingResourceErrors, not withPage: a real 429 response is
  // delivered to the browser between retries, and Chromium logs its own
  // "Failed to load resource" devtools-style message for that -- same
  // reasoning as every other 429-retry test in this codebase (see
  // tests/lib/liveOpenAi.mjs's own extensive comment on this).
  await withPageAllowingResourceErrors(async (page) => {
    mockAzureDeploymentsRoute(page, {
      deployments: [{ id: "rl-deployment", model: "gpt-4o-mini", created_at: 1, status: "succeeded" }],
    });
    await connectAgent(page, { azureEndpoint: AZURE_ENDPOINT });

    let attempt = 0;
    await page.route(azureChatUrl("rl-deployment"), (route) => {
      attempt++;
      if (attempt === 1) {
        route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: { message: "rate limited", code: "429" } }) });
        return;
      }
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(chatCompletionBody("recovered")) });
    });

    await sendChatMessage(page, "hi");
    await page.waitForFunction(() => !window.__kg.agent.isSending(), null, { timeout: 15000 });
    assert.ok(attempt >= 2, "expected at least one retry after the mocked 429");
    const last = await page.evaluate(() => {
      const t = window.__kg.agent.state.transcript;
      return t[t.length - 1];
    });
    assert.equal(last.text, "recovered");
  });
});

// --------------------------------------------------------------------------
// Persistence: remember / forget / disconnect
// --------------------------------------------------------------------------

test("remembering an Azure connection persists both the key and the endpoint, and pre-fills both on next open", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-remember-azure");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.check("#agent-remember-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    const stored = await page.evaluate(() => ({
      key: localStorage.getItem("kg-agent-key"),
      endpoint: localStorage.getItem("kg-agent-azure-endpoint"),
    }));
    assert.equal(stored.key, "sk-remember-azure");
    assert.equal(stored.endpoint, AZURE_ENDPOINT);

    await page.evaluate(() => window.__kg.agent.disconnect());
    await openPanel(page);
    await page.click("#agent-connect-open");
    assert.equal(await page.locator("#agent-key-input").inputValue(), "sk-remember-azure");
    // The endpoint itself is pre-loaded into the pending connect state (and
    // reflected in the summary link) even though the popup isn't open yet.
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureEndpoint()), AZURE_ENDPOINT);
    const linkText = await page.locator("#agent-azure-config-open").textContent();
    assert.match(linkText, /openai\.azure\.com/i);
    await page.click("#agent-azure-config-open");
    assert.equal(await page.locator("#agent-azure-endpoint-input").inputValue(), AZURE_ENDPOINT);
  });
});

test("not remembering an Azure connection persists neither the key nor the endpoint", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page);
    await connectAgent(page, { key: "sk-forget-azure", azureEndpoint: AZURE_ENDPOINT }); // remember checkbox left unchecked
    const stored = await page.evaluate(() => ({
      key: localStorage.getItem("kg-agent-key"),
      endpoint: localStorage.getItem("kg-agent-azure-endpoint"),
    }));
    assert.equal(stored.key, null);
    assert.equal(stored.endpoint, null);
  });
});

test("forgetting a remembered Azure connection clears the endpoint from storage along with the key", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-forget-me-azure");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.check("#agent-remember-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.evaluate(() => window.__kg.agent.forgetStoredKey());
    const stored = await page.evaluate(() => ({
      key: localStorage.getItem("kg-agent-key"),
      endpoint: localStorage.getItem("kg-agent-azure-endpoint"),
    }));
    assert.equal(stored.key, null);
    assert.equal(stored.endpoint, null);
  });
});

test("disconnecting clears azureEndpoint from live state, reverting a subsequent blank-endpoint connect to OpenAI", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page);
    await connectAgent(page, { azureEndpoint: AZURE_ENDPOINT });
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureEndpoint), AZURE_ENDPOINT);

    await page.evaluate(() => window.__kg.agent.disconnect());
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureEndpoint), null);

    await mockOpenAiModelsRoute(page);
    await connectAgent(page); // fresh connect, no endpoint filled in
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureEndpoint), null);
  });
});

// --------------------------------------------------------------------------
// Language toggle
// --------------------------------------------------------------------------

test("the Azure endpoint label and hint retranslate on language toggle, same as every other connect-modal string", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.click("#agent-azure-config-open");
    const enLabel = await page.locator("#agent-azure-endpoint-label").textContent();
    await page.evaluate(() => window.__kg.lang.toggle());
    const otherLabel = await page.locator("#agent-azure-endpoint-label").textContent();
    assert.notEqual(enLabel, otherLabel);
    assert.ok(otherLabel.length > 0);
  });
});

test("the configured-endpoint summary re-renders (still showing the endpoint) on language toggle", async () => {
  await withPage(async (page) => {
    await openPanel(page);
    await page.click("#agent-connect-open");
    await configureAzure(page, AZURE_ENDPOINT);
    await page.evaluate(() => window.__kg.lang.toggle());
    const linkText = await page.locator("#agent-azure-config-open").textContent();
    assert.match(linkText, /openai\.azure\.com/i, "the endpoint itself must survive a language toggle, only the surrounding text translates");
  });
});

// --------------------------------------------------------------------------
// API-version override (the popup's second field, beyond just the key --
// "full endpoint and such edit, beyond the key," design critique 2026-08)
// --------------------------------------------------------------------------

test("an overridden API version is used for both model discovery and chat requests, and the default is used when left blank", async () => {
  await withPage(async (page) => {
    const customVersion = "2025-01-01-preview";
    const customDeploymentsUrl = `${AZURE_ENDPOINT}/openai/deployments?api-version=${customVersion}`;
    let requestedUrl = null;
    await page.route(customDeploymentsUrl, (route) => {
      requestedUrl = route.request().url();
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: [{ id: "d1", model: "gpt-4o-mini", created_at: 1, status: "succeeded" }] }) });
    });

    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "azure-key");
    await configureAzure(page, AZURE_ENDPOINT, customVersion);
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureApiVersion()), customVersion);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    assert.equal(requestedUrl, customDeploymentsUrl, "model discovery should have used the overridden api-version, not the default");

    let chatUrl = null;
    await page.route(`${AZURE_ENDPOINT}/openai/deployments/d1/chat/completions?api-version=${customVersion}`, (route) => {
      chatUrl = route.request().url();
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(chatCompletionBody("ok")) });
    });
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureApiVersion), customVersion);

    await sendChatMessage(page, "hi");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    assert.equal(chatUrl, `${AZURE_ENDPOINT}/openai/deployments/d1/chat/completions?api-version=${customVersion}`);
  });
});

test("leaving the API-version field blank in the popup keeps using the app's default version", async () => {
  await withPage(async (page) => {
    mockAzureDeploymentsRoute(page);
    await connectAgent(page, { azureEndpoint: AZURE_ENDPOINT }); // no azureApiVersion passed -- field left blank
    assert.equal(await page.evaluate(() => window.__kg.agent.state.azureApiVersion), null);
  });
});

test("remembering an Azure connection with a custom API version persists and restores it", async () => {
  await withPage(async (page) => {
    const customVersion = "2025-01-01-preview";
    await page.route(`${AZURE_ENDPOINT}/openai/deployments?api-version=${customVersion}`, (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: [{ id: "d1", model: "gpt-4o-mini", created_at: 1, status: "succeeded" }] }) });
    });
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-remember-version");
    await configureAzure(page, AZURE_ENDPOINT, customVersion);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.check("#agent-remember-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    const stored = await page.evaluate(() => localStorage.getItem("kg-agent-azure-api-version"));
    assert.equal(stored, customVersion);

    await page.evaluate(() => window.__kg.agent.disconnect());
    await openPanel(page);
    await page.click("#agent-connect-open");
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingAzureApiVersion()), customVersion);
    await page.click("#agent-azure-config-open");
    assert.equal(await page.locator("#agent-azure-api-version-input").inputValue(), customVersion);
  });
});
