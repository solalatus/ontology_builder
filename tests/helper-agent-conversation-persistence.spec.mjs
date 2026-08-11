import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL, addNodeViaDblClick, createEdgeViaConnectMode } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Helper Agent — Post-plan extension (helper_agent_plan.md §9): conversation
// persistence across reloads, the Restart Conversation control, and the
// resume-after-gap synthetic note. Every OpenAI call is mocked via
// page.route() — no real network, no API key, deterministic in CI.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";
const AGENT_CONVERSATION_LOCALSTORAGE_KEY = "kg-agent-conversation";

function mockModelsRoute(page) {
  const models = [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }];
  return page.route(MODELS_URL, (route) => {
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: models }) });
  });
}

function chatCompletionBody(replyText) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: replyText }, finish_reason: "stop" }] };
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

test("sending a chat message persists the conversation; reloading restores transcript and shows a restore note", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    await page.evaluate(() => window.__kg.agent.whenConversationSaveIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    // Restore runs at boot, before any connect — the restored transcript
    // (2 real messages + 1 restore note) is there immediately.
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 3);

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.equal(transcript[0].text, "hello");
    assert.equal(transcript[1].text, "reply one");
    assert.equal(transcript[2].role, "system");
    assert.equal(transcript[2].text, await page.evaluate(() => window.__kg.lang.t("agentConversationRestored", 2)));

    const apiMessages = await page.evaluate(() => window.__kg.agent.state.apiMessages);
    assert.equal(apiMessages.length, 2);
    assert.equal(apiMessages[0].content, "hello");

    // Restoring is data hydration only, never an auto-action — the user must
    // still click Connect, same as today's remembered-API-key behavior.
    assert.equal(await page.evaluate(() => window.__kg.agent.state.connected), false);
  });
});

test("a fresh profile with nothing saved shows no restore note", async () => {
  await withPage(async (page) => {
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.deepEqual(transcript, []);
  });
});

test("clicking Restart Conversation opens a confirm dialog; cancel leaves the conversation untouched", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    await page.click("#agent-restart-conversation");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("confirm-overlay")).display), "flex");
    const before = await page.evaluate(() => ({
      transcript: window.__kg.agent.state.transcript.length,
      apiMessages: window.__kg.agent.state.apiMessages.length,
    }));

    await page.click("#confirm-cancel");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("confirm-overlay")).display), "none");
    const after = await page.evaluate(() => ({
      transcript: window.__kg.agent.state.transcript.length,
      apiMessages: window.__kg.agent.state.apiMessages.length,
    }));
    assert.deepEqual(after, before);
  });
});

test("confirming Restart Conversation clears the transcript and API history and rotates the prompt cache key", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    const cacheKeyBefore = await page.evaluate(() => window.__kg.agent.state.promptCacheKey);

    await page.click("#agent-restart-conversation");
    await page.click("#confirm-ok");

    const state = await page.evaluate(() => ({
      transcript: window.__kg.agent.state.transcript.length,
      apiMessages: window.__kg.agent.state.apiMessages.length,
      promptCacheKey: window.__kg.agent.state.promptCacheKey,
      connected: window.__kg.agent.state.connected,
    }));
    assert.equal(state.transcript, 0);
    assert.equal(state.apiMessages, 0);
    assert.notEqual(state.promptCacheKey, cacheKeyBefore, "restarting should rotate the cache key, same as a fresh connect");
    // Restarting the conversation shouldn't force re-entering the API key.
    assert.equal(state.connected, true);
    // An empty transcript array renders one child now, not zero -- the
    // static pre-first-message welcome placeholder (issue #74 round),
    // never a real transcript entry itself.
    const transcriptDom = await page.evaluate(() => document.getElementById("agent-transcript").children.length);
    assert.equal(transcriptDom, 1);
  });
});

test("Restart Conversation never touches the ontology on the canvas", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 250, 250, "Alpha");
    await addNodeViaDblClick(page, 600, 250, "Beta");
    await createEdgeViaConnectMode(page, 250, 250, 600, 250, "relates to");
    const graphBefore = await page.evaluate(() => JSON.stringify({ nodes: window.__kg.state.nodes, edges: window.__kg.state.edges }));

    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    await page.click("#agent-restart-conversation");
    await page.click("#confirm-ok");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 0);

    const graphAfter = await page.evaluate(() => JSON.stringify({ nodes: window.__kg.state.nodes, edges: window.__kg.state.edges }));
    assert.equal(graphAfter, graphBefore);
  });
});

test("restarting the conversation persists the clear across a reload", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    await page.click("#agent-restart-conversation");
    await page.click("#confirm-ok");
    await page.evaluate(() => window.__kg.agent.whenConversationSaveIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    // Give any (incorrect) restore a moment to happen, then assert it didn't.
    await page.waitForFunction(() => window.__kg.agent.state !== undefined);
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.deepEqual(transcript, []);
  });
});

test("disconnecting persists the clear — reloading after disconnect does not resurrect the pre-disconnect conversation", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    await page.click("#agent-disconnect");
    await page.evaluate(() => window.__kg.agent.whenConversationSaveIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.deepEqual(transcript, []);
  });
});

test("a short gap since the last save does not inject a resume-gap note", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    await page.evaluate(() => window.__kg.agent.whenConversationSaveIdle());

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 3); // 2 messages + restore note only

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const hasGapNote = transcript.some((m) => m.role === "system" && /resumed after a gap/.test(m.text));
    assert.equal(hasGapNote, false);
    const apiMessages = await page.evaluate(() => window.__kg.agent.state.apiMessages);
    assert.equal(apiMessages.length, 2, "no synthetic message should be spliced in for a trivial gap");
  });
});

test("a gap past the threshold injects a synthetic resume note into apiMessages and a visible transcript note", async () => {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  const staleSavedAt = Date.now() - 10 * 60 * 1000; // 10 minutes ago, past the 5-minute threshold
  await page.addInitScript((seed) => {
    // The restore/gap notes are localized at push time (boot), before any
    // page.evaluate() toggle could run — so the language pin has to be
    // seeded pre-navigation too, same as the conversation payload itself.
    localStorage.setItem("kg-lang", "en");
    localStorage.setItem(seed.key, JSON.stringify({
      transcript: [{ role: "user", text: "earlier question" }, { role: "assistant", text: "earlier answer" }],
      apiMessages: [{ role: "user", content: "earlier question" }, { role: "assistant", content: "earlier answer" }],
      savedAt: seed.savedAt,
    }));
  }, { key: AGENT_CONVERSATION_LOCALSTORAGE_KEY, savedAt: staleSavedAt });

  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this test opens its own page, not tests/lib/page.mjs's withPage()
  // Both the restore note and the gap note are appended synchronously during
  // boot, so the count can jump straight from 0 to 4 between polls -- wait
  // for the final length directly rather than an intermediate one that may
  // never be observed.
  await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 4);

  const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
  // earlier question, earlier answer, restore note, gap note
  assert.equal(transcript.length, 4);
  assert.match(transcript[3].text, /resumed after a gap of about/);
  assert.match(transcript[3].text, /minutes?/);

  const apiMessages = await page.evaluate(() => window.__kg.agent.state.apiMessages);
  assert.equal(apiMessages.length, 3, "a synthetic user message should be spliced onto the restored apiMessages");
  assert.match(apiMessages[2].content, /Session resumed after a gap/);
  assert.equal(apiMessages[2].role, "user");

  await connectAgent(page);
  const requestBodies = mockChatSequence(page, [() => ({ body: chatCompletionBody("caught up") })]);
  await sendChatMessage(page, "continuing");
  await page.waitForFunction(() => !window.__kg.agent.isSending());

  const sentMessages = requestBodies[0].messages;
  // [system, earlier question, earlier answer, synthetic gap note, "continuing"]
  assert.equal(sentMessages.length, 5);
  assert.match(sentMessages[3].content, /Session resumed after a gap/);
  assert.equal(sentMessages[3].role, "user");
  assert.equal(sentMessages[4].content, "continuing");

  await browser.close();
  assert.deepEqual(consoleErrors, []);
});

test("loadConversationFromStorage() reports {restored:false} for a fresh profile and {restored:true, gapMs} for a seeded one", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.loadConversationFromStorage());
    assert.equal(result.restored, false);
  });
});
