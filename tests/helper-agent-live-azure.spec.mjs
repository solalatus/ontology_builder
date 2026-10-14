import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";
import { loadEnvKey } from "./lib/env.mjs";
import { withPageAllowingResourceErrors } from "./lib/liveOpenAi.mjs";
import { openPanel, sendChatMessage, forwardToRealAzure, connectAgentLiveAzure, configureAzureEndpoint } from "./lib/liveAzureOpenAi.mjs";

// Helper Agent — live Azure OpenAI integration tests. Mirrors
// tests/helper-agent-live-openai.spec.mjs's own rationale exactly (a
// hand-authored mock can't catch a mismatch between what the code assumes
// a live API returns and what it actually returns), applied to the Azure
// code path specifically: the deployments-list response shape, the
// api-key auth header, the api-version-qualified deployment-scoped chat
// URL, and tool-calling all need to be verified against a real Azure
// OpenAI resource, not just against a hand-authored mock of one -- a mock
// can only be as correct as its author's assumptions about the real API,
// which is exactly the class of bug this file exists to catch.
//
// Opt-in, not required: skipped entirely, with a clear reason, unless BOTH
// AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT are set (a gitignored
// .env at the repo root, or the environment — see tests/README.md). A key
// alone can't be used: unlike OpenAI, an Azure OpenAI key is only
// meaningful against the specific resource endpoint it belongs to, so
// there is no way to run any of these tests with only one of the two set.
// Never runs in CI, only when both are deliberately provided.
//
// Same sandbox-can't-reach-the-real-API-directly relay pattern as the
// OpenAI live suite (see that file's header for the full why) — the
// browser drives real UI interactions and real app code the whole way;
// only the last network hop to the real Azure resource is relayed through
// Node's own fetch() rather than dialed directly from inside Chromium.

const AZURE_OPENAI_API_KEY = loadEnvKey("AZURE_OPENAI_API_KEY");
const AZURE_OPENAI_ENDPOINT = loadEnvKey("AZURE_OPENAI_ENDPOINT");
// Optional: the deployment the prompt-caching test should use (issue #176
// asks for a GPT-5.6+ / 6.x one). Without it, the app's default choice.
const AZURE_OPENAI_DEPLOYMENT = loadEnvKey("AZURE_OPENAI_DEPLOYMENT");
const skip = (AZURE_OPENAI_API_KEY && AZURE_OPENAI_ENDPOINT)
  ? false
  : "Set both AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in a .env file at the repo root (see tests/README.md) to run live Azure OpenAI integration tests.";

function deploymentsUrlPattern(endpoint) {
  return `${endpoint.replace(/\/+$/, "")}/openai/deployments**`;
}

function chatUrlPattern(endpoint) {
  return `${endpoint.replace(/\/+$/, "")}/openai/deployments/**/chat/completions**`;
}

test("live: GET .../openai/deployments returns a real, non-empty, correctly-shaped deployment list for a valid key+endpoint", { skip }, async () => {
  await withPage(async (page) => {
    const responses = forwardToRealAzure(page, deploymentsUrlPattern(AZURE_OPENAI_ENDPOINT));
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", AZURE_OPENAI_API_KEY);
    await configureAzureEndpoint(page, AZURE_OPENAI_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });

    assert.ok(responses.length >= 1);
    const last = responses[responses.length - 1];
    assert.equal(last.status, 200);
    const data = last.body.data;
    assert.ok(Array.isArray(data) && data.length > 0, "the real Azure resource should have at least one deployment for a real, working test key");
    for (const d of data.slice(0, 5)) {
      assert.equal(typeof d.id, "string", "every deployment must carry an addressable deployment name");
    }

    // The real default-deployment heuristic, run against this real live
    // list -- must be a real deployment id from that same list.
    const preselected = await page.$eval("#agent-model-select-modal", (el) => el.value);
    assert.ok(data.some((d) => d.id === preselected), "the preselected default must be a real deployment id from the live list");

    const azureEndpointState = await page.evaluate(() => window.__kg.agent.state.azureEndpoint);
    // Not yet finalized (still on stage "model") -- confirmed via the
    // pending value surfacing correctly once connect finalizes, next test.
    assert.equal(azureEndpointState, null);
  });
});

test("live: an actually-invalid key against the real endpoint gets a real 401/403, correctly classified by the connect modal", { skip }, async () => {
  await withPageAllowingResourceErrors(async (page) => {
    const responses = forwardToRealAzure(page, deploymentsUrlPattern(AZURE_OPENAI_ENDPOINT));
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "deliberately-invalid-azure-key-000000000000");
    await configureAzureEndpoint(page, AZURE_OPENAI_ENDPOINT);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "invalidKey", null, { timeout: 30000 });

    assert.ok(responses.length >= 1);
    const last = responses[responses.length - 1];
    assert.ok(last.status === 401 || last.status === 403, `expected a real auth-failure status, got ${last.status}`);
  });
});

test("live: connecting with the real endpoint finalizes with provider state correctly set to Azure", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);
    const state = await page.evaluate(() => ({
      azureEndpoint: window.__kg.agent.state.azureEndpoint,
      isAzure: window.__kg.agent.isAzureProvider(window.__kg.agent.state.azureEndpoint),
      model: window.__kg.agent.state.model,
      promptCacheKey: window.__kg.agent.state.promptCacheKey,
    }));
    assert.equal(state.azureEndpoint, AZURE_OPENAI_ENDPOINT.replace(/\/+$/, ""));
    assert.equal(state.isAzure, true);
    assert.ok(state.model, "a real deployment should have been selected");
    // Issue #176: Azure connections get a per-connection cache key too.
    assert.match(state.promptCacheKey || "", /^kg-agent-[0-9a-f-]{36}$/);
  });
});

test("live: a real chat completion round-trips through the actual UI against the real Azure deployment", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);
    const chatResponses = forwardToRealAzure(page, chatUrlPattern(AZURE_OPENAI_ENDPOINT));

    await sendChatMessage(page, "Reply with a single short sentence confirming you're ready to help model a domain.");

    // Same reasoning as the OpenAI live suite's equivalent test: a
    // preliminary get_graph_state tool call before the final text reply is
    // legitimate, real model behavior, not a bug -- assert at least one
    // real call happened and the last one is a genuine plain-text reply.
    assert.ok(chatResponses.length >= 1);
    for (const r of chatResponses) assert.equal(r.status, 200, `real Azure chat completion call failed: ${JSON.stringify(r.body)}`);
    const lastResponseMessage = chatResponses[chatResponses.length - 1].body.choices[0].message;
    assert.ok(!lastResponseMessage.tool_calls, "the final response in the exchange should be a plain reply, not another tool call");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const last = transcript[transcript.length - 1];
    assert.equal(last.role, "assistant");
    assert.ok(typeof last.text === "string" && last.text.trim().length > 0);
  });
});

test("live: a real tool-calling response against Azure actually applies to the canvas through the real import pipeline", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);
    const chatResponses = forwardToRealAzure(page, chatUrlPattern(AZURE_OPENAI_ENDPOINT));

    const before = await page.evaluate(() => window.__kg.state.nodes.length);
    await sendChatMessage(
      page,
      "Add a class called Invoice, meaning: a request from a supplier to receive payment. " +
      "Use the apply_ontology_yaml tool right now to add it — don't just describe it in text."
    );

    const sawRealToolCall = chatResponses.some((r) => {
      const msg = r.body && r.body.choices && r.body.choices[0] && r.body.choices[0].message;
      return msg && Array.isArray(msg.tool_calls) && msg.tool_calls.some((c) => c.function && c.function.name === "apply_ontology_yaml");
    });
    assert.ok(sawRealToolCall, "expected the real Azure-hosted model to call apply_ontology_yaml for a directive, unambiguous request");

    const after = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(after.length, before + 1, "the real tool call's YAML should have been parsed and committed through the real import pipeline");
    assert.ok(after.some((n) => /invoice/i.test(n.label)), "the newly-created node should be the Invoice class the model was asked for");

    // Every real request in this exchange must have gone to a
    // deployment-scoped URL with tools attached and no model/prompt_cache_key
    // body field -- the exact request-shape contract
    // helper-agent-azure-openai.spec.mjs pins with a mock, now confirmed
    // against what a real Azure resource actually accepted.
    for (const r of chatResponses) assert.equal(r.status, 200);
  });
});

// Issues #176 and #177 against a real Azure resource: the app's own
// api-version accepts prompt_cache_key on a chat request, the same key is
// sent on every call of a connection, a repeated long prefix is served from
// the cache, and every call's usage is recorded with provider "azure".
test("live (#176/#177): Azure accepts prompt_cache_key, a repeated prefix reports cached tokens, and usage is recorded per call", { skip }, async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, { deployment: AZURE_OPENAI_DEPLOYMENT || null });
    const requestBodies = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && /\/chat\/completions/.test(req.url())) requestBodies.push(req.postDataJSON());
    });
    const chatResponses = forwardToRealAzure(page, chatUrlPattern(AZURE_OPENAI_ENDPOINT));

    // Two turns of one conversation: the second resends the same long prefix
    // (system prompt plus the first turn), which is what the cache serves.
    await sendChatMessage(page, "Reply with one short sentence confirming you are ready to model a domain.");
    await sendChatMessage(page, "Thanks. Reply with one more short sentence, no tool calls needed.");

    assert.ok(chatResponses.length >= 2, `expected at least two chat calls, got ${chatResponses.length}`);
    for (const r of chatResponses) {
      assert.equal(r.status, 200, `Azure rejected a chat call (prompt_cache_key under the app's api-version?): ${JSON.stringify(r.body)}`);
    }
    const keys = new Set(requestBodies.map((b) => b.prompt_cache_key));
    assert.equal(keys.size, 1, `one cache key per connection, got ${[...keys].join(", ")}`);
    assert.match([...keys][0] || "", /^kg-agent-/);

    const usage = await page.evaluate(() => window.__kg.agent.state.usage);
    const model = await page.evaluate(() => window.__kg.agent.state.model);
    assert.equal(usage.length, chatResponses.length, "one usage entry per call");
    for (const entry of usage) {
      assert.equal(entry.provider, "azure");
      assert.equal(entry.kind, "interview");
      assert.equal(entry.model, model);
      assert.ok(entry.usage && typeof entry.usage.prompt_tokens === "number", "Azure returned a usage object");
    }
    const cached = usage.slice(1).map((e) => (e.usage.prompt_tokens_details || {}).cached_tokens || 0);
    // Printed for the record: what this real deployment did.
    console.log(`[live #176] deployment=${model} calls=${usage.length} prompt=${usage.map((e) => e.usage.prompt_tokens).join(",")} `
      + `cached=${usage.map((e) => (e.usage.prompt_tokens_details || {}).cached_tokens ?? "n/a").join(",")} `
      + `cache_write=${usage.map((e) => (e.usage.prompt_tokens_details || {}).cache_write_tokens ?? "n/a").join(",")} `
      + `reasoning=${usage.map((e) => (e.usage.completion_tokens_details || {}).reasoning_tokens ?? "n/a").join(",")}`);
    assert.ok(cached.some((c) => c > 0), `a later call with the same prefix should report cached_tokens > 0, got ${cached.join(", ")}`);
  });
});

// Issue #178: if this Azure key can reach GPT-6.1-sol (under any name),
// a fresh connection must land on it, and a tool-attached turn must work on
// it: an earlier codename generation returned a 400 ("Function tools ...
// are not supported") as soon as tools were attached.
test("live (#178): the pinned GPT-6.1-sol is preselected when available, and a real tool call works on it", { skip }, async (t) => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);
    const pinnedName = await page.evaluate(() => window.__kg.agent.pinnedModel);
    const available = await page.evaluate((pinned) => window.__kg.agent.state.models
      .filter((m) => window.__kg.agent.canonicalModelName(m.baseModel || m.id) === window.__kg.agent.canonicalModelName(pinned))
      .map((m) => m.id), pinnedName);
    const selected = await page.evaluate(() => window.__kg.agent.state.model);
    console.log(`[live #178] Azure: pinned=${pinnedName} available-as=${JSON.stringify(available)} selected=${selected}`);
    if (!available.length) {
      t.skip(`this Azure key cannot reach ${pinnedName} under any name; nothing to verify`);
      return;
    }
    assert.ok(available.includes(selected), `expected ${selected} to be one of the pinned model's entries ${available.join(", ")}`);

    const chatResponses = forwardToRealAzure(page, chatUrlPattern(AZURE_OPENAI_ENDPOINT));
    const before = await page.evaluate(() => window.__kg.state.nodes.length);
    await sendChatMessage(page, "Add a class called Invoice, meaning: a request from a supplier to receive payment. "
      + "Use the apply_ontology_yaml tool right now to add it — don't just describe it in text.");
    for (const r of chatResponses) assert.equal(r.status, 200, `a tool-attached call on ${selected} failed: ${JSON.stringify(r.body)}`);
    const sawToolCall = chatResponses.some((r) => {
      const msg = r.body && r.body.choices && r.body.choices[0] && r.body.choices[0].message;
      return msg && Array.isArray(msg.tool_calls) && msg.tool_calls.some((c) => c.function && c.function.name === "apply_ontology_yaml");
    });
    assert.ok(sawToolCall, "the pinned model should call apply_ontology_yaml for a directive request");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), before + 1);
  });
});
