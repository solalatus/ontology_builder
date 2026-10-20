import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { withPage, APP_URL, waitForDownloads } from "./lib/page.mjs";
import { withPageAllowingResourceErrors } from "./lib/liveOpenAi.mjs";

// Issue #183: AWS Bedrock as a third provider. Mocked throughout: no key, no
// network. The live counterpart is tests/helper-agent-live-bedrock.spec.mjs.
//
// What the app relies on (researched and partly probed live, see #183):
// bedrock-mantle is the only Bedrock endpoint a browser can call (CORS);
// GET /v1/models lists models; closed-weight GPT models are served under
// /openai/v1/chat/completions, others (gpt-oss) under /v1; auth is a
// Bearer API key; the model id goes in the body.

const REGION = "us-east-1";
const MANTLE = `https://bedrock-mantle.${REGION}.api.aws`;
const MODELS_URL = `${MANTLE}/v1/models`;
const GPT_CHAT_URL = `${MANTLE}/openai/v1/chat/completions`;
const V1_CHAT_URL = `${MANTLE}/v1/chat/completions`;
const BEDROCK_KEY = "ABSKQmVkcm9ja0FQSUtleS1leGFtcGxlLWtleS0xMjM0NTY3ODkw";
const SHORT_TERM_KEY = "bedrock-api-key-YmVkcm9jay5hbWF6b25hd3MuY29tLz9BY3Rpb249Q2FsbFdpdGhCZWFyZXJUb2tlbg%3D%3D";

const MANTLE_MODELS = [
  { id: "openai.gpt-5.4", object: "model", created: 100, owned_by: "openai" },
  { id: "openai.gpt-6.1-sol", object: "model", created: 300, owned_by: "openai" },
  { id: "openai.gpt-6-astra", object: "model", created: 400, owned_by: "openai" },
  { id: "openai.gpt-oss-120b", object: "model", created: 50, owned_by: "openai" },
  { id: "anthropic.claude-sonnet-5-5", object: "model", created: 500, owned_by: "anthropic" },
  { id: "meta.llama3-3-70b-instruct", object: "model", created: 60, owned_by: "meta" },
];

function mockModels(page, { url = MODELS_URL, status = 200, data = MANTLE_MODELS } = {}) {
  const requests = [];
  page.route(url, (route) => {
    requests.push({ url: route.request().url(), headers: route.request().headers() });
    route.fulfill({
      status, contentType: "application/json",
      body: JSON.stringify(status === 200 ? { object: "list", data } : { error: { code: "invalid_api_key", message: "Invalid bearer token", type: "permission_denied_error" } }),
    });
  });
  return requests;
}

const usage = (prompt, cached) => ({ prompt_tokens: prompt, completion_tokens: 5, total_tokens: prompt + 5, prompt_tokens_details: { cached_tokens: cached, cache_write_tokens: 0 } });
const reply = (content, extra = {}) => ({
  id: "chatcmpl-1", object: "chat.completion", model: "openai.gpt-6.1-sol",
  choices: [{ index: 0, message: { role: "assistant", content, ...extra }, finish_reason: extra.tool_calls ? "tool_calls" : "stop" }],
  usage: usage(1200, 1024),
});

/** Records every chat request at `url`; answers from `responder(body, n)`. */
function mockChat(page, url, responder = () => ({ status: 200, body: reply("Hello.") })) {
  const requests = [];
  page.route(url, (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    requests.push({ url: route.request().url(), headers: route.request().headers(), body });
    const r = responder(body, requests.length);
    route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.body) });
  });
  return requests;
}

async function openConnectModal(page) {
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
}

async function configureBedrock(page, { region = "", endpoint = "" } = {}) {
  await page.click("#agent-bedrock-config-open");
  await page.fill("#agent-bedrock-region-input", region);
  await page.fill("#agent-bedrock-endpoint-input", endpoint);
  await page.click("#agent-bedrock-config-save");
}

/** Key stage then model stage; `model` overrides the preselected one. */
async function connectBedrock(page, { key = BEDROCK_KEY, region = "", endpoint = "", model = null, remember = false, configure = true } = {}) {
  await openConnectModal(page);
  await page.fill("#agent-key-input", key);
  if (configure) await configureBedrock(page, { region, endpoint });
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  if (model) await page.selectOption("#agent-model-select-modal", model);
  if (remember) await page.check("#agent-remember-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

async function sendChat(page, text) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
  await page.waitForFunction(() => !window.__kg.agent.isSending());
}

const lastSystemNote = (page) => page.evaluate(() => {
  const t = window.__kg.agent.state.transcript;
  return t.filter((m) => m.role === "system").pop() || null;
});

// --- Pure functions -----------------------------------------------------------

test("provider resolution, the mantle host and the per-model chat path", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate(() => {
      const a = window.__kg.agent;
      return {
        openai: a.providerOf({ azureEndpoint: null, bedrockBaseUrl: null }),
        azure: a.providerOf({ azureEndpoint: "https://x.openai.azure.com" }),
        bedrock: a.providerOf({ bedrockBaseUrl: "https://bedrock-mantle.us-east-1.api.aws" }),
        empty: a.providerOf(null),
        host: a.bedrockMantleBaseUrl("eu-central-1"),
        defaultRegion: a.bedrockDefaultRegion,
        paths: ["openai.gpt-6.1-sol", "openai.gpt-5.4", "openai.gpt-oss-120b", "openai.gpt-oss-safeguard-20b", "qwen.qwen3-32b"].map(a.bedrockChatPath),
      };
    });
    assert.deepEqual([r.openai, r.azure, r.bedrock, r.empty], ["openai", "azure", "bedrock", "openai"]);
    assert.equal(r.host, "https://bedrock-mantle.eu-central-1.api.aws");
    assert.equal(r.defaultRegion, "us-east-1", "the only in-region home of GPT-6.1 Sol on bedrock-mantle");
    assert.deepEqual(r.paths, ["/openai/v1", "/openai/v1", "/v1", "/v1", "/v1"]);
  });
});

test("an endpoint override is trimmed to its host root, and a bedrock-runtime URL is refused", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate(() => {
      const a = window.__kg.agent;
      const norm = ["https://bedrock-mantle.us-east-1.api.aws/openai/v1", "https://bedrock-mantle.us-east-1.api.aws/v1/", " https://proxy.example.com/ ", "", "   "].map(a.normalizeBedrockEndpoint);
      const problems = ["https://bedrock-mantle.us-east-1.api.aws", "https://bedrock-runtime.us-east-1.amazonaws.com", "https://bedrock-runtime-fips.us-east-1.amazonaws.com", "not a url", "ftp://x.example.com"].map(a.bedrockEndpointProblem);
      return { norm, problems };
    });
    assert.deepEqual(r.norm, ["https://bedrock-mantle.us-east-1.api.aws", "https://bedrock-mantle.us-east-1.api.aws", "https://proxy.example.com", null, null]);
    assert.deepEqual(r.problems, [null, "bedrockRuntimeEndpoint", "bedrockRuntimeEndpoint", "invalidEndpoint", "invalidEndpoint"]);
  });
});

test("models URL, chat URL and auth header for a Bedrock connection", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate((base) => {
      const a = window.__kg.agent;
      const conn = { azureEndpoint: null, bedrockBaseUrl: base };
      return {
        models: a.modelsUrl(conn),
        gpt: a.chatUrl(conn, "openai.gpt-6.1-sol"),
        oss: a.chatUrl(conn, "openai.gpt-oss-120b"),
        forced: a.chatUrl(conn, "openai.gpt-6.1-sol", "/v1"),
        headers: a.authHeaders(conn, "ABSKkey"),
      };
    }, MANTLE);
    assert.equal(r.models, MODELS_URL);
    assert.equal(r.gpt, GPT_CHAT_URL);
    assert.equal(r.oss, V1_CHAT_URL);
    assert.equal(r.forced, V1_CHAT_URL);
    assert.deepEqual(r.headers, { Authorization: "Bearer ABSKkey" });
  });
});

test("Bedrock key shapes are recognised, other keys are not", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate((keys) => keys.map((k) => window.__kg.agent.looksLikeBedrockKey(k)), [BEDROCK_KEY, SHORT_TERM_KEY, "sk-proj-abcdefghijklmnopqrstuvwxyz", "0123456789abcdef0123456789abcdef", "ABSK", ""]);
    assert.deepEqual(r, [true, true, false, false, false, false]);
  });
});

test("Bedrock model ids normalise to the OpenAI name, so the pinned model matches them", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate(() => {
      const a = window.__kg.agent;
      return {
        stripped: ["openai.gpt-6.1-sol", "us.openai.gpt-6.1-sol", "global.openai.gpt-6.1-sol", "us-gov.openai.gpt-5.4", "gpt-5.4"].map(a.stripBedrockModelPrefix),
        canon: ["openai.gpt-6.1-sol", "us.openai.gpt-6.1-sol", "openai.gpt-oss-120b-1:0"].map(a.canonicalModelName),
        pinned: a.canonicalModelName(a.pinnedModel),
        mini: a.canonicalModelName("openai.gpt-6.1-sol-mini"),
      };
    });
    assert.deepEqual(r.stripped, ["gpt-6.1-sol", "gpt-6.1-sol", "gpt-6.1-sol", "gpt-5.4", "gpt-5.4"]);
    assert.equal(r.canon[0], r.pinned);
    assert.equal(r.canon[1], r.pinned);
    assert.equal(r.canon[2], "gptoss120b");
    assert.notEqual(r.mini, r.pinned);
  });
});

// --- The connect modal ----------------------------------------------------------

test("the default modal is still the plain OpenAI key form, with a quiet row offering Azure OpenAI and AWS Bedrock", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    assert.match(await page.textContent("#agent-key-label"), /OpenAI/);
    assert.ok(await page.locator("#agent-azure-config-open").isVisible());
    assert.ok(await page.locator("#agent-bedrock-config-open").isVisible());
    assert.ok(await page.locator("#agent-provider-caption").isVisible());
    assert.equal(await page.locator("#agent-bedrock-region-input").isVisible(), false, "Bedrock fields are not inline in the main modal");
  });
});

test("the Bedrock popup swaps in for the main modal, pre-filled with the default region", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await page.click("#agent-bedrock-config-open");
    assert.ok(await page.locator("#agent-bedrock-config-overlay").isVisible());
    assert.equal(await page.locator("#agent-connect-overlay").isVisible(), false);
    assert.equal(await page.inputValue("#agent-bedrock-region-input"), REGION);
    assert.equal(await page.inputValue("#agent-bedrock-endpoint-input"), "");
    assert.match(await page.textContent("#agent-bedrock-region-hint"), /us-east-1/);
  });
});

test("Save attaches Bedrock: the key label, the summary row and the pending connection all follow", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await configureBedrock(page, { region: "us-west-2" });
    assert.ok(await page.locator("#agent-connect-overlay").isVisible());
    assert.match(await page.textContent("#agent-key-label"), /Bedrock/);
    assert.match(await page.textContent("#agent-bedrock-config-open"), /us-west-2/);
    assert.equal(await page.locator("#agent-azure-config-open").isVisible(), false, "only the configured provider's summary is shown");
    assert.equal(await page.locator("#agent-provider-caption").isVisible(), false);
    const conn = await page.evaluate(() => window.__kg.agent.getPendingConnection());
    assert.equal(conn.bedrockBaseUrl, "https://bedrock-mantle.us-west-2.api.aws");
    assert.equal(conn.azureEndpoint, null);
  });
});

test("a pasted endpoint override is trimmed and shown; a blank region falls back to the default", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await configureBedrock(page, { region: "", endpoint: "https://bedrock-mantle.us-east-2.api.aws/openai/v1" });
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), { region: REGION, endpoint: "https://bedrock-mantle.us-east-2.api.aws" });
    assert.match(await page.textContent("#agent-bedrock-config-open"), /bedrock-mantle\.us-east-2\.api\.aws/);
  });
});

test("Cancel discards edits; Remove detaches Bedrock and restores the plain row", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await page.click("#agent-bedrock-config-open");
    await page.fill("#agent-bedrock-region-input", "eu-west-1");
    await page.click("#agent-bedrock-config-cancel");
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), null);

    await configureBedrock(page, { region: "eu-west-1" });
    await page.click("#agent-bedrock-config-open");
    await page.click("#agent-bedrock-config-remove");
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), null);
    assert.ok(await page.locator("#agent-azure-config-open").isVisible());
    assert.ok(await page.locator("#agent-provider-caption").isVisible());
    assert.doesNotMatch(await page.textContent("#agent-key-label"), /Bedrock/);
  });
});

test("invalid settings are refused in the popup itself: a malformed region, a bedrock-runtime endpoint", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await configureBedrock(page, { region: "Virginia" });
    assert.ok(await page.locator("#agent-bedrock-config-overlay").isVisible(), "stays open on an error");
    assert.equal(await page.evaluate(() => window.__kg.agent.getBedrockConfigErrorKind()), "invalidRegion");
    assert.match(await page.textContent("#agent-bedrock-config-error"), /region/i);

    await page.fill("#agent-bedrock-region-input", REGION);
    await page.fill("#agent-bedrock-endpoint-input", "https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1");
    await page.click("#agent-bedrock-config-save");
    assert.equal(await page.evaluate(() => window.__kg.agent.getBedrockConfigErrorKind()), "bedrockRuntimeEndpoint");
    assert.match(await page.textContent("#agent-bedrock-config-error"), /bedrock-mantle/);
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), null);
  });
});

test("Azure and Bedrock are mutually exclusive: saving one clears the other", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", "https://my-resource.openai.azure.com");
    await page.click("#agent-azure-config-save");
    assert.equal(await page.locator("#agent-bedrock-config-open").isVisible(), false);

    // Bedrock is reachable again once Azure is removed; saving it then
    // leaves Azure unset.
    await page.click("#agent-azure-config-open");
    await page.click("#agent-azure-config-remove");
    await configureBedrock(page, {});
    let conn = await page.evaluate(() => window.__kg.agent.getPendingConnection());
    assert.equal(conn.azureEndpoint, null);
    assert.equal(conn.bedrockBaseUrl, MANTLE);

    // And the other way round, through the pure handlers.
    await page.evaluate(() => {
      document.getElementById("agent-azure-endpoint-input").value = "https://my-resource.openai.azure.com";
      window.__kg.agent.saveAzureConfig();
    });
    conn = await page.evaluate(() => window.__kg.agent.getPendingConnection());
    assert.equal(conn.bedrockBaseUrl, null);
    assert.equal(conn.azureEndpoint, "https://my-resource.openai.azure.com");
  });
});

test("Escape closes the Bedrock popup back to the main modal", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await page.click("#agent-bedrock-config-open");
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#agent-bedrock-config-overlay").isVisible(), false);
    assert.ok(await page.locator("#agent-connect-overlay").isVisible());
  });
});

test("the popup and the summary retranslate on a language toggle", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await configureBedrock(page, { region: "eu-north-1" });
    const before = await page.textContent("#agent-bedrock-config-open");
    await page.evaluate(() => window.__kg.lang.toggle());
    const after = await page.textContent("#agent-bedrock-config-open");
    assert.notEqual(before, after);
    assert.match(after, /eu-north-1/);
    await page.click("#agent-bedrock-config-open");
    const title = await page.textContent("#agent-bedrock-config-title");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.notEqual(await page.textContent("#agent-bedrock-config-title"), title);
  });
});

// --- Key auto-detection ----------------------------------------------------------

test("pasting a Bedrock key selects Bedrock in the default region; another key shape undoes only that", async () => {
  await withPage(async (page) => {
    await openConnectModal(page);
    await page.fill("#agent-key-input", SHORT_TERM_KEY);
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), { region: REGION, endpoint: null });
    assert.match(await page.textContent("#agent-key-label"), /Bedrock/);
    await page.fill("#agent-key-input", "sk-proj-abcdefghijklmnopqrstuvwxyz");
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), null, "auto-attached, so auto-detached");

    // A Bedrock setting the user saved stays, whatever key is typed.
    await configureBedrock(page, { region: "us-west-2" });
    await page.fill("#agent-key-input", "sk-proj-abcdefghijklmnopqrstuvwxyz");
    assert.equal((await page.evaluate(() => window.__kg.agent.getPendingBedrock())).region, "us-west-2");

    // An explicit Azure choice is never overridden by a Bedrock-shaped key.
    await page.click("#agent-bedrock-config-open");
    await page.click("#agent-bedrock-config-remove");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", "https://my-resource.openai.azure.com");
    await page.click("#agent-azure-config-save");
    await page.fill("#agent-key-input", BEDROCK_KEY);
    assert.equal(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), null);
  });
});

// --- Connecting and chatting -------------------------------------------------------

test("connecting lists bedrock-mantle's OpenAI models with a Bearer key and preselects GPT-6.1 Sol", async () => {
  await withPage(async (page) => {
    const modelRequests = mockModels(page);
    await openConnectModal(page);
    await page.fill("#agent-key-input", BEDROCK_KEY); // auto-detected, no popup needed
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    assert.equal(modelRequests.length, 1);
    assert.equal(modelRequests[0].url, MODELS_URL);
    assert.equal(modelRequests[0].headers.authorization, `Bearer ${BEDROCK_KEY}`);
    assert.equal(modelRequests[0].headers["api-key"], undefined);
    const options = await page.$$eval("#agent-model-select-modal option", (os) => os.map((o) => o.value));
    assert.deepEqual([...options].sort(), ["openai.gpt-5.4", "openai.gpt-6-astra", "openai.gpt-6.1-sol", "openai.gpt-oss-120b"], "only OpenAI's models");
    assert.equal(await page.inputValue("#agent-model-select-modal"), "openai.gpt-6.1-sol", "the pinned model, not the newer GPT-6 Astra");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    const state = await page.evaluate(() => window.__kg.agent.state);
    assert.equal(state.bedrockBaseUrl, MANTLE);
    assert.equal(state.bedrockRegion, REGION);
    assert.equal(state.azureEndpoint, null);
    assert.equal(state.model, "openai.gpt-6.1-sol");
  });
});

test("a rejected key and an empty model list surface the usual connect errors", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page, { status: 401 });
    await openConnectModal(page);
    await page.fill("#agent-key-input", BEDROCK_KEY);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() !== null);
    assert.equal(await page.evaluate(() => window.__kg.agent.getConnectErrorKind()), "invalidKey");
  });
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page, { data: MANTLE_MODELS.filter((m) => !m.id.startsWith("openai.")) });
    await openConnectModal(page);
    await page.fill("#agent-key-input", BEDROCK_KEY);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() !== null);
    assert.equal(await page.evaluate(() => window.__kg.agent.getConnectErrorKind()), "noModels");
  });
});

test("a chat turn posts to /openai/v1 with the model in the body, a Bearer key and the connection's prompt_cache_key", async () => {
  await withPage(async (page) => {
    mockModels(page);
    const chats = mockChat(page, GPT_CHAT_URL);
    await connectBedrock(page);
    await sendChat(page, "Hello");
    await sendChat(page, "Again");
    assert.equal(chats.length, 2);
    for (const c of chats) {
      assert.equal(c.url, GPT_CHAT_URL);
      assert.equal(c.headers.authorization, `Bearer ${BEDROCK_KEY}`);
      assert.equal(c.body.model, "openai.gpt-6.1-sol");
      assert.ok(Array.isArray(c.body.tools) && c.body.tools.length > 0, "tools attached");
      assert.match(c.body.prompt_cache_key, /^kg-agent-[0-9a-f-]{36}$/);
    }
    assert.equal(chats[0].body.prompt_cache_key, chats[1].body.prompt_cache_key, "one key per connection");
    const usageLog = await page.evaluate(() => window.__kg.agent.state.usage);
    assert.deepEqual(usageLog.map((e) => [e.kind, e.provider, e.model]), [["interview", "bedrock", "openai.gpt-6.1-sol"], ["interview", "bedrock", "openai.gpt-6.1-sol"]]);
    assert.equal(usageLog[0].usage.prompt_tokens_details.cached_tokens, 1024);
  });
});

test("a gpt-oss model goes to /v1 straight away", async () => {
  await withPage(async (page) => {
    mockModels(page);
    const v1 = mockChat(page, V1_CHAT_URL);
    const gpt = mockChat(page, GPT_CHAT_URL);
    await connectBedrock(page, { model: "openai.gpt-oss-120b" });
    await sendChat(page, "Hello");
    assert.equal(v1.length, 1);
    assert.equal(gpt.length, 0);
  });
});

test("a model rejected on its first-guess route is retried once under the other prefix, which then sticks", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page);
    const gpt = mockChat(page, GPT_CHAT_URL, () => ({ status: 400, body: { error: { message: "model `openai.gpt-6.1-sol` isn't supported on this route", type: "invalid_request_error" } } }));
    const v1 = mockChat(page, V1_CHAT_URL);
    await connectBedrock(page);
    await sendChat(page, "Hello");
    assert.equal(gpt.length, 1);
    assert.equal(v1.length, 1);
    assert.equal(await lastSystemNote(page), null, "no error reached the transcript");
    await sendChat(page, "Again");
    assert.equal(gpt.length, 1, "the working route is remembered");
    assert.equal(v1.length, 2);
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.state.bedrockRoutes), { "openai.gpt-6.1-sol": "/v1" });
  });
});

test("if both routes reject the model, the turn fails with the generic error instead of looping", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page);
    const reject = () => ({ status: 400, body: { error: { message: "model `openai.gpt-6.1-sol` isn't supported on this route" } } });
    const gpt = mockChat(page, GPT_CHAT_URL, reject);
    const v1 = mockChat(page, V1_CHAT_URL, reject);
    await connectBedrock(page);
    await sendChat(page, "Hello");
    assert.equal(gpt.length + v1.length, 2);
    assert.equal((await lastSystemNote(page)).text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorGeneric")));
  });
});

test("a provider that rejects prompt_cache_key gets the call again without it, and never again on that connection", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page);
    const chats = mockChat(page, GPT_CHAT_URL, (body) => body.prompt_cache_key
      ? { status: 400, body: { error: { message: "Unrecognized request argument supplied: prompt_cache_key", type: "invalid_request_error" } } }
      : { status: 200, body: reply("Fine.") });
    await connectBedrock(page);
    await sendChat(page, "Hello");
    await sendChat(page, "Again");
    assert.deepEqual(chats.map((c) => "prompt_cache_key" in c.body), [true, false, false]);
    assert.equal(await lastSystemNote(page), null);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.promptCacheKeyRejected), true);
  });
});

test("an unrelated 400 is not mistaken for a rejected prompt_cache_key", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page);
    const chats = mockChat(page, GPT_CHAT_URL, () => ({ status: 400, body: { error: { message: "Invalid value for 'tool_choice'." } } }));
    await connectBedrock(page);
    await sendChat(page, "Hello");
    assert.equal(chats.length, 1);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.promptCacheKeyRejected), false);
  });
});

test("the background checks use the same Bedrock connection (model-based consistency check, CQ coverage)", async () => {
  await withPage(async (page) => {
    mockModels(page);
    const chats = mockChat(page, GPT_CHAT_URL, () => ({ status: 200, body: reply("```json\n[]\n```") }));
    await connectBedrock(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), [
      "competency_questions:", "  - text: Which policy applies to a request?",
      "classes:", "  Request: {}", "  Policy: {}",
      "relationships:", "  - name: governedBy", "    from: Request", "    to: Policy", "",
    ].join("\n"));
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await page.evaluate(() => window.__kg.consistency.cqCoverage.run());
    await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());
    assert.equal(chats.length, 2);
    assert.ok(chats.every((c) => c.body.model === "openai.gpt-6.1-sol" && c.headers.authorization === `Bearer ${BEDROCK_KEY}`));
    const kinds = await page.evaluate(() => window.__kg.agent.state.usage.map((e) => `${e.kind}:${e.provider}`));
    assert.deepEqual(kinds, ["consistency_llm:bedrock", "cq_coverage:bedrock"]);
  });
});

// --- Persistence -----------------------------------------------------------------

test("remembering a Bedrock connection stores the key and region (and only an overriding endpoint), and pre-fills them", async () => {
  await withPage(async (page) => {
    mockModels(page, { url: "https://bedrock-mantle.us-east-2.api.aws/v1/models" });
    await connectBedrock(page, { region: "us-east-2", remember: true });
    const stored = await page.evaluate(() => ({
      key: localStorage.getItem("kg-agent-key"),
      region: localStorage.getItem("kg-agent-bedrock-region"),
      endpoint: localStorage.getItem("kg-agent-bedrock-endpoint"),
      azure: localStorage.getItem("kg-agent-azure-endpoint"),
    }));
    assert.deepEqual(stored, { key: BEDROCK_KEY, region: "us-east-2", endpoint: null, azure: null });

    await page.evaluate(() => window.__kg.agent.disconnect());
    assert.equal(await page.evaluate(() => window.__kg.agent.state.bedrockBaseUrl), null);
    await page.click("#agent-connect-open");
    assert.equal(await page.inputValue("#agent-key-input"), BEDROCK_KEY);
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.getPendingBedrock()), { region: "us-east-2", endpoint: null });
    assert.match(await page.textContent("#agent-bedrock-config-open"), /us-east-2/);
  });
});

test("an overriding endpoint is remembered too; not remembering or forgetting stores nothing", async () => {
  await withPage(async (page) => {
    const proxy = "https://llm-proxy.example.com";
    mockModels(page, { url: `${proxy}/v1/models` });
    await connectBedrock(page, { endpoint: proxy, remember: true });
    assert.equal(await page.evaluate(() => localStorage.getItem("kg-agent-bedrock-endpoint")), proxy);
    await page.click("#agent-forget-key");
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => /^kg-agent-(key|model|azure|bedrock)/.test(k)));
    assert.deepEqual(left, []);
  });
  await withPage(async (page) => {
    mockModels(page);
    await connectBedrock(page, { remember: false });
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => /^kg-agent-(key|model|azure|bedrock)/.test(k)));
    assert.deepEqual(left, []);
  });
});

test("switching a remembered connection from Azure to Bedrock leaves no Azure settings behind", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      localStorage.setItem("kg-agent-key", "azure-key");
      localStorage.setItem("kg-agent-azure-endpoint", "https://my-resource.openai.azure.com");
      localStorage.setItem("kg-agent-azure-api-version", "2024-12-01-preview");
    });
    mockModels(page);
    await openConnectModal(page);
    assert.ok(await page.locator("#agent-azure-config-open").isVisible());
    await page.click("#agent-azure-config-open");
    await page.click("#agent-azure-config-remove");
    await page.fill("#agent-key-input", BEDROCK_KEY);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.check("#agent-remember-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    const stored = await page.evaluate(() => ({
      azure: localStorage.getItem("kg-agent-azure-endpoint"),
      version: localStorage.getItem("kg-agent-azure-api-version"),
      region: localStorage.getItem("kg-agent-bedrock-region"),
    }));
    assert.deepEqual(stored, { azure: null, version: null, region: REGION });
  });
});

// --- Session bundle ----------------------------------------------------------------

test("the session bundle records provider bedrock and never contains the key", async () => {
  const browser = await launchChromium();
  // browser.newPage, not newContext().newPage, and English: see
  // tests/session-usage.spec.mjs on this sandbox's download-name quirk.
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  try {
    await page.goto(APP_URL);
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); window.__kg.welcome.close(); });
    mockModels(page);
    mockChat(page, GPT_CHAT_URL, () => ({ status: 200, body: reply(`I saw your key ${BEDROCK_KEY} and ${SHORT_TERM_KEY}.`) }));
    await connectBedrock(page);
    await sendChat(page, `my key is ${BEDROCK_KEY}`);
    await page.click("#btn-save-version");
    await page.click("#export-whole-session");
    await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
    await waitForDownloads(downloads, 4);
    const dl = downloads.find((d) => d.suggestedFilename().endsWith(".session.json"));
    const chunks = [];
    for await (const c of await dl.createReadStream()) chunks.push(c);
    const text = Buffer.concat(chunks).toString("utf8");
    const bundle = JSON.parse(text);
    assert.equal(bundle.interviewer.provider, "bedrock");
    assert.equal(bundle.interviewer.model, "openai.gpt-6.1-sol");
    assert.equal(bundle.usage.calls[0].provider, "bedrock");
    assert.ok(!text.includes(BEDROCK_KEY), "the connection's key is scrubbed");
    assert.ok(!text.includes(SHORT_TERM_KEY), "any Bedrock-shaped key is scrubbed");
  } finally {
    await browser.close();
  }
});

test("the prompt_cache_key fallback is provider-agnostic: an Azure API version that rejects it is handled the same way", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    const endpoint = "https://my-resource.openai.azure.com";
    page.route(`${endpoint}/openai/deployments?**`, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ data: [{ id: "sol", model: "gpt-6.1-sol", created_at: 1, status: "succeeded" }] }),
    }));
    const chats = mockChat(page, `${endpoint}/openai/deployments/sol/chat/completions?**`, (body) => body.prompt_cache_key
      ? { status: 400, body: { error: { code: "unknown_parameter", message: "Unknown parameter: 'prompt_cache_key'." } } }
      : { status: 200, body: reply("Fine.") });
    await openConnectModal(page);
    await page.fill("#agent-key-input", "azure-secret");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", endpoint);
    await page.click("#agent-azure-config-save");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    await sendChat(page, "Hello");
    assert.deepEqual(chats.map((c) => "prompt_cache_key" in c.body), [true, false]);
    assert.equal(await lastSystemNote(page), null);
  });
});

// Checked live on Azure (2026-10-19): the GPT-6 codename models answer a
// tool-carrying Chat Completions call with this 400 and point to the
// Responses API, where tools and reasoning work together. The app moves
// that connection's tool calls there rather than switching reasoning off.
const TOOLS_NEED_RESPONSES = {
  status: 400,
  body: { error: { message: "Function tools with reasoning_effort are not supported for this model in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.", type: "invalid_request_error", param: "reasoning_effort" } },
};
const responsesUsage = { input_tokens: 1300, input_tokens_details: { cached_tokens: 1267, cache_write_tokens: 31 }, output_tokens: 20, output_tokens_details: { reasoning_tokens: 12 }, total_tokens: 1320 };
const responsesToolCall = { id: "resp_1", model: "gpt-6-sol-2026-09-22", output: [
  { type: "reasoning", id: "rs_1", summary: [] },
  { type: "function_call", id: "fc_1", call_id: "call_abc", name: "get_graph_state", arguments: "{}" },
], usage: responsesUsage };
const responsesText = (text) => ({ id: "resp_2", model: "gpt-6-sol-2026-09-22", output: [
  { type: "message", role: "assistant", content: [{ type: "output_text", text }] },
], usage: responsesUsage });

test("pure translation: chat history to Responses input, tools, and the answer back", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate(() => {
      const a = window.__kg.agent;
      return {
        input: a.chatMessagesToResponsesInput([
          { role: "system", content: "S" },
          { role: "user", content: [{ type: "text", text: "U" }] },
          { role: "assistant", content: null, tool_calls: [{ id: "c1", type: "function", function: { name: "f", arguments: "{\"x\":1}" } }] },
          { role: "tool", tool_call_id: "c1", content: "Applied." },
          { role: "assistant", content: "Done." },
        ]),
        tools: a.chatToolsToResponsesTools([{ type: "function", function: { name: "f", description: "d", parameters: { type: "object" } } }]),
        back: a.responsesToChatCompletion({
          model: "m", output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: "Hi" }] }, { type: "function_call", call_id: "c2", name: "g", arguments: "{}" }],
          usage: { input_tokens: 10, input_tokens_details: { cached_tokens: 4 }, output_tokens: 3, output_tokens_details: { reasoning_tokens: 2 }, total_tokens: 13 },
        }),
        urls: [
          a.responsesUrl({ azureEndpoint: null }, "gpt-6-sol"),
          a.responsesUrl({ azureEndpoint: "https://r.openai.azure.com" }, "dep"),
          a.responsesUrl({ bedrockBaseUrl: "https://bedrock-mantle.us-east-1.api.aws" }, "openai.gpt-6.1-sol"),
        ],
      };
    });
    assert.deepEqual(r.input, [
      { role: "system", content: "S" },
      { role: "user", content: "U" },
      { type: "function_call", call_id: "c1", name: "f", arguments: "{\"x\":1}" },
      { type: "function_call_output", call_id: "c1", output: "Applied." },
      { role: "assistant", content: "Done." },
    ]);
    assert.deepEqual(r.tools, [{ type: "function", name: "f", description: "d", parameters: { type: "object" } }]);
    assert.deepEqual(r.back, {
      model: "m",
      choices: [{ index: 0, message: { role: "assistant", content: "Hi", tool_calls: [{ id: "c2", type: "function", function: { name: "g", arguments: "{}" } }] }, finish_reason: "tool_calls" }],
      usage: { prompt_tokens: 10, completion_tokens: 3, total_tokens: 13, prompt_tokens_details: { cached_tokens: 4 }, completion_tokens_details: { reasoning_tokens: 2 } },
    });
    assert.deepEqual(r.urls, [
      "https://api.openai.com/v1/responses",
      "https://r.openai.azure.com/openai/v1/responses",
      "https://bedrock-mantle.us-east-1.api.aws/openai/v1/responses",
    ]);
  });
});

test("Azure: a model that refuses tools with reasoning on Chat Completions gets its tool calls through the Responses API, reasoning kept", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    const endpoint = "https://my-resource.openai.azure.com";
    page.route(`${endpoint}/openai/deployments?**`, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ data: [{ id: "sol", model: "gpt-6-sol", created_at: 1, status: "succeeded" }] }),
    }));
    const chats = mockChat(page, `${endpoint}/openai/deployments/sol/chat/completions?**`, (body) => body.tools
      ? TOOLS_NEED_RESPONSES
      : { status: 200, body: reply("```json\n[]\n```") });
    const responses = mockChat(page, `${endpoint}/openai/v1/responses`, (body, n) => ({ status: 200, body: n === 1 ? responsesToolCall : responsesText("Done.") }));
    await openConnectModal(page);
    await page.fill("#agent-key-input", "azure-secret");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", endpoint);
    await page.click("#agent-azure-config-save");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await sendChat(page, "Hello");
    assert.equal(await lastSystemNote(page), null, "no error reached the transcript");
    assert.equal(chats.length, 1, "one refused Chat Completions call");
    assert.equal(responses.length, 2, "the tool round and the reply, both on Responses");
    const [first, second] = responses;
    assert.equal(first.headers["api-key"], "azure-secret");
    assert.equal(first.body.model, "sol", "the deployment name as model");
    assert.equal(first.body.store, false);
    assert.deepEqual(first.body.reasoning, { effort: "high" }, "reasoning kept on, at the explicit default effort (#181, `high` since #187), never switched off");
    assert.match(first.body.prompt_cache_key, /^kg-agent-/);
    assert.ok(first.body.tools.every((t) => t.type === "function" && t.name && !t.function), "tools in the Responses shape");
    assert.equal(first.body.input[0].role, "system");
    assert.deepEqual(second.body.input.slice(-2), [
      { type: "function_call", call_id: "call_abc", name: "get_graph_state", arguments: "{}" },
      { type: "function_call_output", call_id: "call_abc", output: second.body.input.at(-1).output },
    ]);
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript.map((m) => m.text));
    assert.ok(transcript.includes("Done."));

    // Calls without tools stay on Chat Completions, reasoning untouched.
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), "classes:\n  A: {}\n  B: {}\nrelationships:\n  - name: r\n    from: A\n    to: B\n");
    await page.evaluate(() => window.__kg.consistency.llm.run());
    assert.equal(chats.length, 2);
    assert.equal(chats[1].body.tools, undefined);
    assert.equal(chats[1].body.reasoning_effort, "high", "the same explicit effort on Chat Completions");
    assert.equal(responses.length, 2);

    const usageLog = await page.evaluate(() => window.__kg.agent.state.usage);
    assert.deepEqual(usageLog.map((e) => [e.kind, e.api ?? "chat_completions"]), [["interview", "responses"], ["interview", "responses"], ["consistency_llm", "chat_completions"]]);
    assert.equal(usageLog[0].usage.prompt_tokens, 1300);
    assert.equal(usageLog[0].usage.prompt_tokens_details.cached_tokens, 1267);
    assert.equal(usageLog[0].usage.completion_tokens_details.reasoning_tokens, 12);

    await page.evaluate(() => window.__kg.agent.disconnect());
    assert.equal(await page.evaluate(() => window.__kg.agent.state.toolsViaResponses), false, "a new connection starts on Chat Completions");
  });
});

test("Bedrock: the same switch uses bedrock-mantle's Responses route", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page);
    mockChat(page, GPT_CHAT_URL, (body) => (body.tools ? TOOLS_NEED_RESPONSES : { status: 200, body: reply("ok") }));
    const responses = mockChat(page, `${MANTLE}/openai/v1/responses`, () => ({ status: 200, body: responsesText("Hi.") }));
    await connectBedrock(page);
    await sendChat(page, "Hello");
    assert.equal(responses.length, 1);
    assert.equal(responses[0].body.model, "openai.gpt-6.1-sol");
    assert.equal(responses[0].headers.authorization, `Bearer ${BEDROCK_KEY}`);
    assert.equal(await lastSystemNote(page), null);
  });
});

test("an unrelated reasoning_effort error is not mistaken for the tools restriction", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page);
    const chats = mockChat(page, GPT_CHAT_URL, () => ({ status: 400, body: { error: { message: "Unsupported value: 'reasoning_effort' does not support 'minimal' with this model.", param: "reasoning_effort" } } }));
    await connectBedrock(page);
    await sendChat(page, "Hello");
    assert.equal(chats.length, 1);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.toolsViaResponses), false);
  });
});
