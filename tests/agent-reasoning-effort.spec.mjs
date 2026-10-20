import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { withPage, APP_URL, waitForDownloads } from "./lib/page.mjs";
import { withPageAllowingResourceErrors } from "./lib/liveOpenAi.mjs";

// Issue #181, Part 1: the reasoning effort is sent explicitly to every
// reasoning model, identically on every provider and on both routes (Chat
// Completions `reasoning_effort`, Responses API `reasoning.effort`); never to
// a non-reasoning model; `high` by default since #187, `medium` selectable per
// connection; a rejection is reported, never silently dropped. Mocked: no key,
// no network. The live acceptance check is agent-reasoning-effort-live.spec.mjs.

const OPENAI_MODELS = "https://api.openai.com/v1/models";
const OPENAI_CHAT = "https://api.openai.com/v1/chat/completions";
const OPENAI_RESPONSES = "https://api.openai.com/v1/responses";

const reply = (content = "Understood.") => ({
  id: "c", object: "chat.completion", model: "m",
  choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
  usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12, completion_tokens_details: { reasoning_tokens: 1 } },
});

function mockModels(page, ids) {
  page.route(OPENAI_MODELS, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: ids.map((id, i) => ({ id, created: 100 + i, object: "model" })) }),
  }));
}

/** Records request bodies at `url`; answers from `responder(body, n)`. */
function mockRoute(page, url, responder = () => ({ status: 200, body: reply() })) {
  const bodies = [];
  page.route(url, (route) => {
    const body = route.request().postDataJSON();
    bodies.push(body);
    const r = responder(body, bodies.length);
    route.fulfill({ status: r.status, contentType: "application/json", body: JSON.stringify(r.body) });
  });
  return bodies;
}

async function openDialogToModelStage(page, key = "sk-test-key-0123456789") {
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", key);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
}

async function connect(page, { model = null, effort = null, remember = false } = {}) {
  await openDialogToModelStage(page);
  if (model) await page.selectOption("#agent-model-select-modal", model);
  if (effort) await page.selectOption("#agent-reasoning-effort-select", effort);
  if (remember) await page.check("#agent-remember-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

async function send(page, text = "Hello") {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
  await page.waitForFunction(() => !window.__kg.agent.isSending());
}

const lastSystemNote = (page) => page.evaluate(() => {
  const t = window.__kg.agent.state.transcript.filter((m) => m.role === "system");
  return t.length ? t[t.length - 1].text : null;
});

test("the default effort is high (#187) and only medium and high are offered", async () => {
  await withPage(async (page) => {
    const r = await page.evaluate(() => ({ efforts: window.__kg.agent.reasoningEfforts, def: window.__kg.agent.reasoningEffortDefault }));
    assert.deepEqual(r, { efforts: ["medium", "high"], def: "high" });
    const options = await page.$$eval("#agent-reasoning-effort-select option", (os) => os.map((o) => o.value));
    assert.deepEqual(options, ["medium", "high"], "no `none`, no lower level");
  });
});

test("the effort row appears in the model stage for a reasoning model only, and follows the selection", async () => {
  await withPage(async (page) => {
    mockModels(page, ["gpt-4o-mini", "gpt-5.5"]);
    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    assert.equal(await page.locator("#agent-effort-row").isVisible(), false, "not in the key stage");
    await page.fill("#agent-key-input", "sk-test-key-0123456789");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    assert.equal(await page.inputValue("#agent-model-select-modal"), "gpt-5.5");
    assert.ok(await page.locator("#agent-effort-row").isVisible());
    assert.equal(await page.inputValue("#agent-reasoning-effort-select"), "high");
    await page.selectOption("#agent-model-select-modal", "gpt-4o-mini");
    assert.equal(await page.locator("#agent-effort-row").isVisible(), false);
    await page.selectOption("#agent-model-select-modal", "gpt-5.5");
    assert.ok(await page.locator("#agent-effort-row").isVisible());
  });
});

test("OpenAI: a reasoning model gets reasoning_effort on every call kind; the chosen level is the one sent", async () => {
  await withPage(async (page) => {
    mockModels(page, ["gpt-5.5"]);
    const chats = mockRoute(page, OPENAI_CHAT, (body) => ({ status: 200, body: reply(body.tools ? "Hi." : "```json\n[]\n```") }));
    await connect(page);
    await send(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), "classes:\n  A: {}\n  B: {}\nrelationships:\n  - name: r\n    from: A\n    to: B\n");
    await page.evaluate(() => window.__kg.consistency.llm.run());
    assert.deepEqual(chats.map((b) => [Boolean(b.tools), b.reasoning_effort]), [[true, "high"], [false, "high"]], "interview and background check alike");
    const usage = await page.evaluate(() => window.__kg.agent.state.usage.map((e) => e.reasoning_effort));
    assert.deepEqual(usage, ["high", "high"], "the usage log records the effort each call was sent with");
  });
  await withPage(async (page) => {
    mockModels(page, ["gpt-5.5"]);
    const chats = mockRoute(page, OPENAI_CHAT);
    await connect(page, { effort: "medium" });
    await send(page);
    assert.equal(chats[0].reasoning_effort, "medium");
    assert.equal(await page.evaluate(() => window.__kg.agent.effectiveReasoningEffort()), "medium");
  });
});

test("a non-reasoning model never gets the parameter, even after switching to it mid-connection", async () => {
  await withPage(async (page) => {
    mockModels(page, ["gpt-4o-mini"]);
    const chats = mockRoute(page, OPENAI_CHAT);
    await connect(page);
    await send(page);
    assert.equal("reasoning_effort" in chats[0], false);
    assert.equal(await page.evaluate(() => window.__kg.agent.effectiveReasoningEffort()), null);
  });
  await withPage(async (page) => {
    mockModels(page, ["gpt-4o-mini", "gpt-5.5"]);
    const chats = mockRoute(page, OPENAI_CHAT);
    await connect(page, { effort: "high" });
    await send(page);
    await page.selectOption("#agent-model-select", "gpt-4o-mini");
    await send(page, "Again");
    assert.deepEqual(chats.map((b) => [b.model, b.reasoning_effort ?? null]), [["gpt-5.5", "high"], ["gpt-4o-mini", null]]);
  });
});

test("Azure: the deployment's underlying model decides, and the effort rides on the deployment-scoped call", async () => {
  await withPage(async (page) => {
    const endpoint = "https://my-resource.openai.azure.com";
    page.route(`${endpoint}/openai/deployments?**`, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ data: [{ id: "prod-chat", model: "gpt-5.5", created_at: 1, status: "succeeded" }] }),
    }));
    const chats = mockRoute(page, `${endpoint}/openai/deployments/prod-chat/chat/completions?**`);
    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "azure-secret");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", endpoint);
    await page.click("#agent-azure-config-save");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    assert.ok(await page.locator("#agent-effort-row").isVisible(), "a free-form deployment name, but a reasoning model underneath");
    await page.selectOption("#agent-reasoning-effort-select", "high");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    await send(page);
    assert.equal(chats[0].reasoning_effort, "high");
  });
});

test("on the Responses route the same effort is sent as reasoning.effort", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page, ["gpt-6-sol"]);
    const chats = mockRoute(page, OPENAI_CHAT, (body) => (body.tools
      ? { status: 400, body: { error: { message: "Function tools with reasoning_effort are not supported for this model in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.", param: "reasoning_effort" } } }
      : { status: 200, body: reply() }));
    const responses = mockRoute(page, OPENAI_RESPONSES, () => ({ status: 200, body: {
      model: "gpt-6-sol", output: [{ type: "message", content: [{ type: "output_text", text: "Hi." }] }],
      usage: { input_tokens: 10, output_tokens: 2, total_tokens: 12, output_tokens_details: { reasoning_tokens: 1 } },
    } }));
    await connect(page, { effort: "high" });
    await send(page);
    assert.equal(chats[0].reasoning_effort, "high", "the refused Chat Completions call carried it too");
    assert.deepEqual(responses[0].reasoning, { effort: "high" });
    assert.equal("reasoning_effort" in responses[0], false, "the Responses API's own shape, not Chat Completions'");
    assert.equal(await lastSystemNote(page), null);
  });
});

test("a model that rejects the effort gets a clear error naming the model and level, and the parameter is not dropped", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    mockModels(page, ["gpt-5.5"]);
    const chats = mockRoute(page, OPENAI_CHAT, () => ({ status: 400, body: { error: {
      message: "Unsupported value: 'reasoning_effort' does not support 'high' with this model. Supported values are: 'low' and 'medium'.",
      type: "invalid_request_error", param: "reasoning_effort",
    } } }));
    await connect(page, { effort: "high" });
    await send(page);
    assert.equal(chats.length, 1, "no retry without the parameter");
    const note = await lastSystemNote(page);
    assert.equal(note, await page.evaluate(() => window.__kg.lang.t("agentChatErrorReasoningEffort", "gpt-5.5", "high")));
    assert.match(note, /gpt-5\.5/);
    assert.match(note, /high/);
  });
});

test("a remembered connection keeps a non-default effort; the default is not stored; Forget clears it", async () => {
  await withPage(async (page) => {
    mockModels(page, ["gpt-5.5"]);
    mockRoute(page, OPENAI_CHAT);
    await connect(page, { effort: "medium", remember: true });
    assert.equal(await page.evaluate(() => localStorage.getItem("kg-agent-reasoning-effort")), "medium");
    await page.evaluate(() => window.__kg.agent.disconnect());
    assert.equal(await page.evaluate(() => window.__kg.agent.state.reasoningEffort), "high", "a disconnect resets the live state");
    await page.click("#agent-connect-open");
    assert.equal(await page.inputValue("#agent-reasoning-effort-select"), "medium", "pre-filled from the remembered connection");
    await page.click("#agent-connect-cancel");
    await page.click("#agent-forget-key");
    assert.equal(await page.evaluate(() => localStorage.getItem("kg-agent-reasoning-effort")), null);
  });
  await withPage(async (page) => {
    mockModels(page, ["gpt-5.5"]);
    await connect(page, { remember: true });
    assert.equal(await page.evaluate(() => localStorage.getItem("kg-agent-reasoning-effort")), null);
  });
});

test("the effort row retranslates on a language toggle", async () => {
  await withPage(async (page) => {
    mockModels(page, ["gpt-5.5"]);
    await openDialogToModelStage(page);
    const label = await page.textContent("#agent-effort-label");
    const option = await page.textContent("#agent-reasoning-effort-select option[value=medium]");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.notEqual(await page.textContent("#agent-effort-label"), label);
    assert.notEqual(await page.textContent("#agent-reasoning-effort-select option[value=medium]"), option);
  });
});

test("the session bundle records the effort sent", async () => {
  const browser = await launchChromium();
  // browser.newPage and English: see tests/session-usage.spec.mjs on this
  // sandbox's download-name quirk.
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  try {
    await page.goto(APP_URL);
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); window.__kg.welcome.close(); });
    mockModels(page, ["gpt-5.5"]);
    mockRoute(page, OPENAI_CHAT);
    await connect(page, { effort: "high" });
    await send(page);
    await page.click("#btn-save-version");
    await page.click("#export-whole-session");
    await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
    await waitForDownloads(downloads, 4);
    const dl = downloads.find((d) => d.suggestedFilename().endsWith(".session.json"));
    const chunks = [];
    for await (const c of await dl.createReadStream()) chunks.push(c);
    const bundle = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    assert.equal(bundle.interviewer.reasoning_effort, "high");
    assert.equal(bundle.usage.calls[0].reasoning_effort, "high");
  } finally {
    await browser.close();
  }
});
