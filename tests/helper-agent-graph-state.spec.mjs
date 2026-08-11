import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL, addNodeViaDblClick } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Helper Agent — get_graph_state (a read-only pull tool, chosen over
// auto-injecting live state into the system prompt specifically to keep
// OpenAI's prompt-prefix caching intact across a connection; see
// GET_GRAPH_STATE_TOOL's own comment in index.html). Behavioral guarding
// (the model is expected to call this proactively) lives entirely in the
// system prompt's "STAYING IN SYNC" section — these tests cover the
// mechanism the prompt relies on, not the model's actual behavior (which
// can't be tested here, since every OpenAI call is mocked).

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function mockModelsRoute(page) {
  const models = [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }];
  return page.route(MODELS_URL, (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: models }) });
  });
}

function chatCompletionBody(replyText) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: replyText }, finish_reason: "stop" }] };
}

function toolCall(id, name, argsObj) {
  return { id, type: "function", function: { name, arguments: JSON.stringify(argsObj) } };
}

function toolCallCompletionBody(toolCalls, content = null) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content, tool_calls: toolCalls }, finish_reason: "tool_calls" }] };
}

function mockChatSequence(page, responders) {
  const requestBodies = [];
  let callIndex = 0;
  page.route(CHAT_URL, (route) => {
    const body = route.request().postDataJSON();
    requestBodies.push(body);
    const responder = responders[Math.min(callIndex, responders.length - 1)];
    callIndex++;
    const { status = 200, body: responseBody } = responder(body, callIndex);
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(responseBody) });
  });
  return requestBodies;
}

async function connectAgent(page) {
  await mockModelsRoute(page);
  const expanded = await page.evaluate(() => window.__kg.agent.isExpanded());
  if (!expanded) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

async function sendChatMessage(page, text) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
}

async function withPageAllowingResourceErrors(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this file has its own page-open helper, not tests/lib/page.mjs's withPage()
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  const unexpected = consoleErrors.filter((m) => !/Failed to load resource/.test(m));
  assert.deepEqual(unexpected, [], "expected no console/page errors other than a mocked fetch failure's own resource-load log");
}

async function lastTranscriptMessage(page) {
  return page.evaluate(() => {
    const t = window.__kg.agent.state.transcript;
    return t[t.length - 1];
  });
}

test("get_graph_state on an empty graph returns the same minimal YAML buildDomainYamlExport() would", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", "get_graph_state", {})]) }),
      () => ({ body: chatCompletionBody("the ontology is currently empty") }),
    ]);

    await sendChatMessage(page, "what's already defined?");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const expected = await page.evaluate(() => window.buildDomainYamlExport());
    const toolResultMessage = bodies[1].messages.find((m) => m.role === "tool" && m.tool_call_id === "call_1");
    assert.equal(toolResultMessage.content, expected);
  });
});

test("get_graph_state reflects real canvas content, including a class added by a prior apply_ontology_yaml call in the same conversation", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", "apply_ontology_yaml", { yaml: "classes:\n  Invoice:\n    meaning: A request for payment.\n" })]) }),
      () => ({ body: chatCompletionBody("added Invoice") }),
    ]);
    await sendChatMessage(page, "add invoice");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const bodies = mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_2", "get_graph_state", {})]) }),
      () => ({ body: chatCompletionBody("here's what's defined so far") }),
    ]);
    await sendChatMessage(page, "what do we have so far?");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const expected = await page.evaluate(() => window.buildDomainYamlExport());
    assert.match(expected, /Invoice:/); // sanity check the fixture itself
    const toolResultMessage = bodies[1].messages.find((m) => m.role === "tool" && m.tool_call_id === "call_2");
    assert.equal(toolResultMessage.content, expected);
  });
});

test("get_graph_state also picks up a manual edit made through the canvas UI, outside the conversation entirely", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    // A manual edit through the real UI, nothing to do with the chat at all.
    await addNodeViaDblClick(page, 700, 300, "ManuallyAdded");

    const bodies = mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", "get_graph_state", {})]) }),
      () => ({ body: chatCompletionBody("ok") }),
    ]);
    await sendChatMessage(page, "what's there?");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const toolResultMessage = bodies[1].messages.find((m) => m.role === "tool" && m.tool_call_id === "call_1");
    assert.match(toolResultMessage.content, /ManuallyAdded:/);
  });
});

test("get_graph_state does not consume the one-real-commit-per-turn budget — a subsequent apply_ontology_yaml call in the same turn still commits", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    mockChatSequence(page, [
      () => ({
        body: toolCallCompletionBody([
          toolCall("call_1", "get_graph_state", {}),
          toolCall("call_2", "apply_ontology_yaml", { yaml: "classes:\n  Invoice:\n    meaning: A request for payment.\n" }),
        ]),
      }),
      () => ({ body: chatCompletionBody("done") }),
    ]);

    await sendChatMessage(page, "check state then add invoice");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Invoice"), "the apply call must still commit even though get_graph_state ran first in the same turn");
    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter - historyBefore, 1, "still exactly one undo step for the turn");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const toolNotes = transcript.filter((m) => m.role === "tool");
    assert.equal(toolNotes.length, 2);
    assert.match(toolNotes[0].text, /checked|ellenő/i);
    assert.match(toolNotes[1].text, /applied|alkalmazva/i);
  });
});

test("calling get_graph_state never creates an undo step by itself", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", "get_graph_state", {})]) }),
      () => ({ body: toolCallCompletionBody([toolCall("call_2", "get_graph_state", {})]) }),
      () => ({ body: chatCompletionBody("done checking") }),
    ]);

    await sendChatMessage(page, "double-check the state");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter, historyBefore);
  });
});

test("repeatedly calling only get_graph_state, never replying, is still bounded by the same tool-round limit", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    let callCount = 0;
    await page.route(CHAT_URL, (route) => {
      callCount++;
      route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify(toolCallCompletionBody([toolCall(`call_${callCount}`, "get_graph_state", {})])),
      });
    });

    await sendChatMessage(page, "keep checking forever");
    await page.waitForFunction(() => !window.__kg.agent.isSending(), { timeout: 15000 });

    assert.ok(callCount <= 10, `expected a bounded number of calls, got ${callCount}`);
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    assert.match(last.text, /too many|stopped/i);
  });
});

test("every chat request's tools array includes get_graph_state with no required arguments", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [() => ({ body: chatCompletionBody("ok") })]);

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const tool = bodies[0].tools.find((tl) => tl.function.name === "get_graph_state");
    assert.ok(tool, "get_graph_state must be attached to every request");
    assert.deepEqual(tool.function.parameters.properties, {});
    assert.deepEqual(tool.function.parameters.required, []);
  });
});

test("the system prompt's content is identical before and after the graph changes — proving the live state is never baked into the cached prefix", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [
      () => ({ body: chatCompletionBody("first reply") }),
      () => ({ body: chatCompletionBody("second reply") }),
    ]);

    await sendChatMessage(page, "message before any edit");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    await addNodeViaDblClick(page, 700, 300, "NewClass");

    await sendChatMessage(page, "message after an edit");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 4);

    const systemPromptBefore = bodies[0].messages[0].content;
    const systemPromptAfter = bodies[1].messages[0].content;
    assert.equal(systemPromptBefore, systemPromptAfter, "the system prompt must stay byte-identical regardless of graph content, to keep the prompt-prefix cache hit");
    assert.ok(!systemPromptBefore.includes("NewClass"), "the live graph content must never leak into the cached system prompt itself");
  });
});

test("prompt_cache_key is present, stable across multiple messages in one connection, and a fresh one is issued per connection", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [
      () => ({ body: chatCompletionBody("one") }),
      () => ({ body: chatCompletionBody("two") }),
    ]);

    await sendChatMessage(page, "first");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    await sendChatMessage(page, "second");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 4);

    assert.ok(bodies[0].prompt_cache_key, "a cache key must be sent");
    assert.equal(bodies[0].prompt_cache_key, bodies[1].prompt_cache_key, "the same connection must reuse one cache key across turns");

    const firstConnectionKey = bodies[0].prompt_cache_key;
    await page.click("#agent-disconnect");
    await connectAgent(page);
    const bodiesAfterReconnect = mockChatSequence(page, [() => ({ body: chatCompletionBody("three") })]);
    await sendChatMessage(page, "third, after reconnecting");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    assert.notEqual(bodiesAfterReconnect[0].prompt_cache_key, firstConnectionKey, "a fresh connection must get its own cache key, not reuse the previous session's");
  });
});

test("an unrecognized tool name is handled gracefully rather than crashing the chat loop", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", "some_future_tool_this_client_does_not_know", { anything: "goes" })]) }),
      () => ({ body: chatCompletionBody("recovered") }),
    ]);

    await sendChatMessage(page, "trigger an unknown tool somehow");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "recovered");
  });
});
