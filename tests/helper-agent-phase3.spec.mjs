import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Helper Agent (helper_agent_plan.md), Phase 3: tool-calling. The model can
// call apply_ontology_yaml, which is wired to the exact same
// parseDomainYamlImport()/planYamlImport()/commitYamlImport() pipeline the
// manual Import dialog already uses (merge-only, one undo step per turn).
// Every OpenAI call is mocked via page.route() — no real network, no API
// key, deterministic in CI.

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

function toolCall(id, argsObj) {
  return { id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify(argsObj) } };
}

function toolCallCompletionBody(toolCalls, content = null) {
  return { id: "chatcmpl-test", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content, tool_calls: toolCalls }, finish_reason: "tool_calls" }] };
}

function contextLengthErrorBody() {
  return { error: { message: "This model's maximum context length is exceeded.", type: "invalid_request_error", code: "context_length_exceeded" } };
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

const SIMPLE_CLASS_YAML = "classes:\n  Invoice:\n    meaning: A request for payment.\n";

test("a tool call with valid YAML actually edits the canvas through the real import pipeline, in exactly one undo step", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: SIMPLE_CLASS_YAML })]) }),
      () => ({ body: chatCompletionBody("I've added the Invoice class — what should it connect to?") }),
    ]);

    await sendChatMessage(page, "Let's start with invoices.");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Invoice"), "the Invoice class should now exist on the canvas");

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter - historyBefore, 1, "the whole turn must cost exactly one undo step");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const toolNote = transcript.find((m) => m.role === "tool");
    assert.ok(toolNote, "an applied-diff note should appear in the transcript");
    assert.match(toolNote.text, /Applied|added/i);
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "I've added the Invoice class — what should it connect to?");
  });
});

test("undoing after a tool-call turn removes exactly what the tool added", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: SIMPLE_CLASS_YAML })]) }),
      () => ({ body: chatCompletionBody("done") }),
    ]);

    await sendChatMessage(page, "add invoice");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    assert.ok((await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label))).includes("Invoice"));

    await page.evaluate(() => window.__kg.actions.undo());
    const nodeLabelsAfterUndo = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(!nodeLabelsAfterUndo.includes("Invoice"), "undo should remove the tool-added class");
  });
});

test("only the first of several tool_calls in one response actually commits; the rest are skipped with a visible note", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [
      () => ({
        body: toolCallCompletionBody([
          toolCall("call_1", { yaml: "classes:\n  Invoice:\n    meaning: A request for payment.\n" }),
          toolCall("call_2", { yaml: "classes:\n  Supplier:\n    meaning: An organization providing goods.\n" }),
        ]),
      }),
      () => ({ body: chatCompletionBody("done") }),
    ]);

    await sendChatMessage(page, "add invoice and supplier");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Invoice"));
    assert.ok(!nodeLabels.includes("Supplier"), "only the first tool call should actually commit");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const toolNotes = transcript.filter((m) => m.role === "tool");
    assert.equal(toolNotes.length, 2, "both outcomes (applied + skipped) should be visible");
    assert.match(toolNotes[1].text, /skip/i);

    // The follow-up call must carry a tool-role response for *both* tool_call_ids, not just the first.
    const followUpMessages = bodies[1].messages;
    const toolResponses = followUpMessages.filter((m) => m.role === "tool");
    assert.equal(toolResponses.length, 2);
    assert.deepEqual(toolResponses.map((m) => m.tool_call_id).sort(), ["call_1", "call_2"]);
  });
});

test("malformed tool-call arguments surface an error note instead of throwing", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => ({
        body: {
          id: "chatcmpl-test", object: "chat.completion",
          choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "apply_ontology_yaml", arguments: "{not valid json" } }] }, finish_reason: "tool_calls" }],
        },
      }),
      () => ({ body: chatCompletionBody("let me try again") }),
    ]);

    await sendChatMessage(page, "add something");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const toolNote = transcript.find((m) => m.role === "tool");
    assert.ok(toolNote, "an error note should appear for malformed arguments");
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "let me try again");
  });
});

test("YAML that adds or changes nothing shows a 'nothing to apply' note and creates no undo step", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: "classes: {}\n" })]) }),
      () => ({ body: chatCompletionBody("ok, what next?") }),
    ]);

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter, historyBefore, "a no-op tool call must not create an undo step");
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const toolNote = transcript.find((m) => m.role === "tool");
    assert.match(toolNote.text, /nothing/i);
  });
});

test("the tool never removes pre-existing, unmentioned classes — merge only, replace is never reachable", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    // Seed a pre-existing class the tool call's YAML never mentions.
    await page.evaluate(() => window.__kg.actions.createNode(100, 100, "Existing"));

    mockChatSequence(page, [
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: SIMPLE_CLASS_YAML })]) }),
      () => ({ body: chatCompletionBody("done") }),
    ]);

    await sendChatMessage(page, "add invoice");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Existing"), "pre-existing classes must survive a tool call that doesn't mention them");
    assert.ok(nodeLabels.includes("Invoice"));
  });
});

test("every chat request carries the apply_ontology_yaml tool definition", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [() => ({ body: chatCompletionBody("ok") })]);

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    assert.equal(bodies[0].tool_choice, "auto");
    // apply_ontology_yaml plus get_graph_state (tests/helper-agent-graph-state.spec.mjs
    // covers the read-only tool itself in depth) — this test only pins the write tool.
    const names = bodies[0].tools.map((tl) => tl.function.name);
    assert.ok(names.includes("apply_ontology_yaml"));
    const applyTool = bodies[0].tools.find((tl) => tl.function.name === "apply_ontology_yaml");
    assert.deepEqual(applyTool.function.parameters.required, ["yaml"]);
  });
});

test("a bounded number of tool-call rounds gives up cleanly instead of looping forever", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    let callCount = 0;
    await page.route(CHAT_URL, (route) => {
      callCount++;
      // Always returns another tool call with no-op YAML — nothing ever actually
      // commits, so the loop can only be stopped by the round-count bound itself.
      route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify(toolCallCompletionBody([toolCall(`call_${callCount}`, { yaml: "classes: {}\n" })])),
      });
    });

    await sendChatMessage(page, "keep going forever");
    await page.waitForFunction(() => !window.__kg.agent.isSending(), { timeout: 15000 });

    assert.ok(callCount <= 10, `expected a bounded number of calls, got ${callCount}`);
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    assert.match(last.text, /too many|stopped/i);
    assert.equal(await page.isDisabled("#agent-chat-input"), false, "input must recover, not stay stuck disabled");
  });
});

test("a context-length rejection during a tool-calling turn still triggers summarization and recovers", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await page.evaluate(() => {
      for (let i = 0; i < 4; i++) {
        window.__kg.agent.state.apiMessages.push({ role: "user", content: `prior turn ${i}` });
        window.__kg.agent.state.apiMessages.push({ role: "assistant", content: `prior reply ${i}` });
      }
    });
    mockChatSequence(page, [
      () => ({ status: 400, body: contextLengthErrorBody() }), // original call overflows
      () => ({ body: chatCompletionBody("summary of earlier turns") }), // summarization call
      () => ({ body: toolCallCompletionBody([toolCall("call_1", { yaml: SIMPLE_CLASS_YAML })]) }), // retried call now succeeds, and calls the tool
      () => ({ body: chatCompletionBody("added it") }), // follow-up after the tool call
    ]);

    await sendChatMessage(page, "a message that overflows context and also wants an edit");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const nodeLabels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(nodeLabels.includes("Invoice"), "the edit should still apply after context-length recovery");
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "added it");
  });
});
