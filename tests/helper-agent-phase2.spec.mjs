import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Helper Agent (helper_agent_plan.md), Phase 2: live chat, no tools yet.
// Real Chat Completions calls, the output-language lock (plan §4.9), and
// the reactive context-length summarization flow (plan §4.10). Every
// OpenAI call is mocked via page.route() — no real network, no API key,
// deterministic in CI.

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

function contextLengthErrorBody() {
  return { error: { message: "This model's maximum context length is exceeded.", type: "invalid_request_error", code: "context_length_exceeded" } };
}

// Serves a scripted sequence of responses, one per call, capturing every
// request body along the way so tests can assert on what was actually sent
// (system prompt content, absence of a `tools` field, message counts, ...).
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

// Mirrors withPage() (tests/lib/page.mjs), but tolerates the console
// message Chromium logs for a non-2xx/aborted fetch() response ("Failed to
// load resource: ...") — the browser's own devtools-style resource log, not
// an application error, and an expected byproduct of the error-path tests
// below that deliberately mock a failing response.
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

// Compaction only has something to do once the conversation already has
// more turns than AGENT_CONTEXT_KEEP_RECENT — seeding a handful of prior
// exchanges directly (rather than round-tripping them through the mocked
// route) keeps the compaction tests focused on the compaction behavior
// itself, not on re-proving the already-covered happy-path send/receive.
async function seedAgentPriorHistory(page, turns) {
  await page.evaluate((n) => {
    for (let i = 0; i < n; i++) {
      window.__kg.agent.state.apiMessages.push({ role: "user", content: `prior user turn ${i}` });
      window.__kg.agent.state.apiMessages.push({ role: "assistant", content: `prior assistant turn ${i}` });
    }
  }, turns);
}

test("sending a message appends a user bubble, then an assistant reply, and re-enables input", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("Hello! What domain are we modeling today?") })]);

    await sendChatMessage(page, "Let's model invoices.");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2 && !window.__kg.agent.isSending());

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.equal(transcript[0].role, "user");
    assert.equal(transcript[0].text, "Let's model invoices.");
    assert.equal(transcript[1].role, "assistant");
    assert.equal(transcript[1].text, "Hello! What domain are we modeling today?");
    assert.equal(await page.isDisabled("#agent-chat-input"), false);
  });
});

test("input and send are disabled while a reply is in flight, and the typing indicator shows", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    let resolveRoute;
    const gate = new Promise((resolve) => { resolveRoute = resolve; });
    await page.route(CHAT_URL, async (route) => {
      await gate;
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(chatCompletionBody("done")) });
    });

    await sendChatMessage(page, "hi");
    await page.waitForFunction(() => window.__kg.agent.isSending());
    assert.equal(await page.isDisabled("#agent-chat-input"), true);
    assert.equal(await page.isDisabled("#agent-chat-send"), true);
    const typingVisible = await page.evaluate(() => getComputedStyle(document.getElementById("agent-typing-indicator")).display !== "none");
    assert.equal(typingVisible, true);

    resolveRoute();
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    assert.equal(await page.isDisabled("#agent-chat-input"), false);
  });
});

test("the send button stays disabled until the input has non-whitespace text", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    assert.equal(await page.isDisabled("#agent-chat-send"), true);
    await page.fill("#agent-chat-input", "   ");
    assert.equal(await page.isDisabled("#agent-chat-send"), true);
    await page.fill("#agent-chat-input", "  hello");
    assert.equal(await page.isDisabled("#agent-chat-send"), false);
  });
});

test("pressing Enter in the chat input sends the message", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("ack") })]);
    await page.fill("#agent-chat-input", "hello via enter");
    await page.press("#agent-chat-input", "Enter");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.equal(transcript[0].text, "hello via enter");
  });
});

test("assistant and user message content is rendered as text, never as markup (XSS safety)", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const payload = '<img src=x onerror="window.__xssFired = true">';
    mockChatSequence(page, [() => ({ body: chatCompletionBody(payload) })]);

    await sendChatMessage(page, payload);
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    const fired = await page.evaluate(() => window.__xssFired === true);
    assert.equal(fired, false, "the payload must never execute as markup");
    const imgCount = await page.locator("#agent-transcript img").count();
    assert.equal(imgCount, 0);
    const transcriptText = await page.textContent("#agent-transcript");
    assert.ok(transcriptText.includes(payload), "the raw text should still be visible as literal text");
  });
});

test("every request resends the system prompt, matching the current UI language", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [() => ({ body: chatCompletionBody("ok") })]);

    await sendChatMessage(page, "first message");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    assert.equal(bodies[0].messages[0].role, "system");
    assert.match(bodies[0].messages[0].content, /OUTPUT LANGUAGE: English \(en\)/);
    // Whether a `tools` field is attached is Phase 3's concern (tests/helper-agent-phase3.spec.mjs) —
    // this test only pins the system prompt/language behavior that's Phase 2's own.
  }, { lang: "en" });
});

test("toggling the app language changes the system prompt's language directive on the next request", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    const bodies = mockChatSequence(page, [
      () => ({ body: chatCompletionBody("ok en") }),
      () => ({ body: chatCompletionBody("ok hu") }),
    ]);

    await sendChatMessage(page, "message one");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    assert.match(bodies[0].messages[0].content, /OUTPUT LANGUAGE: English \(en\)/);

    await page.evaluate(() => window.__kg.lang.toggle());
    await sendChatMessage(page, "message two");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 4);
    assert.match(bodies[1].messages[0].content, /OUTPUT LANGUAGE: Hungarian \(hu\)/);
  }, { lang: "en" });
});

test("a context-length rejection triggers summarization, then a successful retry, without shortening the visible transcript", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await seedAgentPriorHistory(page, 4); // gives the first-level compaction actual "older" content to summarize
    const bodies = mockChatSequence(page, [
      () => ({ status: 400, body: contextLengthErrorBody() }),
      () => ({ body: chatCompletionBody("Summary: invoices, suppliers, one open question.") }),
      () => ({ body: chatCompletionBody("Continuing from where we left off — what's next?") }),
    ]);

    await sendChatMessage(page, "a message that hypothetically overflows the context window");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    assert.equal(bodies.length, 3, "expected: original call, summarization call, retried call");
    // The retried (3rd) call's apiMessages are the compacted set: the tagged
    // summary plus whatever was kept verbatim, not the original full history.
    const retriedMessages = bodies[2].messages;
    assert.ok(retriedMessages.some((m) => typeof m.content === "string" && m.content.startsWith("[Earlier conversation summary]:")));

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    // Full UI transcript: user's original message, a compacted-context note, and the final reply — never trimmed.
    assert.equal(transcript[0].role, "user");
    assert.equal(transcript[0].text, "a message that hypothetically overflows the context window");
    const compactedNoteText = await page.evaluate(() => window.__kg.lang.t("agentContextCompacted"));
    assert.ok(transcript.some((m) => m.role === "system" && m.text === compactedNoteText));
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "Continuing from where we left off — what's next?");
  });
});

test("a second context-length rejection after the first compaction falls back to a deeper compaction before succeeding", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await seedAgentPriorHistory(page, 4);
    const bodies = mockChatSequence(page, [
      () => ({ status: 400, body: contextLengthErrorBody() }), // original call
      () => ({ body: chatCompletionBody("first summary") }),    // 1st compaction's summarization call
      () => ({ status: 400, body: contextLengthErrorBody() }),  // retry still overflows
      () => ({ body: chatCompletionBody("second summary") }),   // 2nd (fallback) compaction's summarization call
      () => ({ body: chatCompletionBody("finally succeeded") }),// final retry succeeds
    ]);

    await sendChatMessage(page, "a very long message");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    assert.equal(bodies.length, 5);
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "finally succeeded");
    // Two distinct compaction notes should appear in the transcript, one per compaction pass.
    const compactedNoteText = await page.evaluate(() => window.__kg.lang.t("agentContextCompacted"));
    const noteCount = await page.evaluate(
      (noteText) => window.__kg.agent.state.transcript.filter((m) => m.role === "system" && m.text === noteText).length,
      compactedNoteText,
    );
    assert.equal(noteCount, 2);
  });
});

test("exhausting compaction attempts surfaces a clear error instead of retrying forever", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await seedAgentPriorHistory(page, 4);
    let callCount = 0;
    await page.route(CHAT_URL, (route) => {
      callCount++;
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify(contextLengthErrorBody()) });
    });

    await sendChatMessage(page, "a message that never fits, no matter how much we summarize");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    // Original call + 2 bounded compaction/retry attempts' worth of calls, not unbounded.
    assert.ok(callCount <= 5, `expected a bounded number of calls, got ${callCount}`);
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorContextLength")));
    assert.equal(await page.isDisabled("#agent-chat-input"), false, "input must recover, not stay stuck disabled");
  });
});

test("an invalid API key mid-conversation shows a distinct chat error, not a fabricated assistant reply", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await page.route(CHAT_URL, (route) => {
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { message: "Invalid API key", code: "invalid_api_key" } }) });
    });

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorInvalidKey")));
  });
});

test("a rate-limit response shows a distinct chat error", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await page.route(CHAT_URL, (route) => {
      route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: { message: "Rate limit reached" } }) });
    });

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorRateLimit")));
  });
});

// A 429 with error.code "insufficient_quota" is a permanently exhausted
// billing balance, not a transient rate limit -- "wait a moment and try
// again" is actively wrong advice for it. Confirmed live against a real
// out-of-quota OpenAI key (tests/helper-agent-live-openai.spec.mjs); this is
// the mocked regression test locking the fix in for CI, which has no key.
test("a 429 with error.code=insufficient_quota shows a distinct message from an ordinary rate limit", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await page.route(CHAT_URL, (route) => {
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "You exceeded your current quota, please check your plan and billing details.", type: "insufficient_quota", code: "insufficient_quota" } }),
      });
    });

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    const [insufficientQuotaText, rateLimitText] = await page.evaluate(() => [
      window.__kg.lang.t("agentChatErrorInsufficientQuota"),
      window.__kg.lang.t("agentChatErrorRateLimit"),
    ]);
    assert.equal(last.text, insufficientQuotaText);
    assert.notEqual(last.text, rateLimitText);
  });
});

// A 429 with no error.code at all (or an unrecognized one) must not be
// mistaken for insufficient_quota -- falls back to the ordinary rate-limit
// message, exactly like the sibling test above without a "code" field.
test("a 429 with an unrecognized error.code still falls back to the ordinary rate-limit message", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await page.route(CHAT_URL, (route) => {
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Too many requests", code: "rate_limit_exceeded" } }),
      });
    });

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    const last = await lastTranscriptMessage(page);
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorRateLimit")));
  });
});

// A transient rate limit is worth waiting a moment for, not an immediate
// hard failure -- callAgentChatRaw (index.html) now retries a 429 with
// backoff before giving up. mockChatSequence serves a different response
// per call (429, 429, then a real success), so a passing test here proves
// the retry loop actually re-sent the request rather than just eventually
// showing an error.
test("a transient rate-limit response is retried with backoff and succeeds once the API recovers", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    const rateLimitBody = { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } };
    const requestBodies = mockChatSequence(page, [
      () => ({ status: 429, body: rateLimitBody }),
      () => ({ status: 429, body: rateLimitBody }),
      () => ({ body: chatCompletionBody("Sorry for the wait -- let's continue.") }),
    ]);

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending(), null, { timeout: 15000 });
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "assistant");
    assert.equal(last.text, "Sorry for the wait -- let's continue.");
    assert.equal(requestBodies.length, 3, "expected the two failed attempts plus the eventual success, not just one call");
  });
});

// The retry loop must not run forever -- it's bounded (index.html's
// AGENT_RATE_LIMIT_MAX_ATTEMPTS: 1 initial try + 3 retries = 4 total) so a
// rate limit that never clears still surfaces to the user eventually
// instead of hanging the chat indefinitely.
test("a rate limit that never clears is retried a bounded number of times, then gives up", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    const requestBodies = mockChatSequence(page, [
      () => ({ status: 429, body: { error: { message: "Rate limit reached", code: "rate_limit_exceeded" } } }),
    ]);

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending(), null, { timeout: 15000 });
    const last = await lastTranscriptMessage(page);
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorRateLimit")));
    assert.equal(requestBodies.length, 4, "expected exactly 4 total attempts (1 initial + 3 retries), not an unbounded retry loop");
  });
});

// insufficient_quota is permanent (an exhausted billing balance) -- retrying
// it wastes time and API calls on something backoff can never fix, so it
// must fail on the very first attempt, unlike the ordinary rate-limit case
// above.
test("an insufficient_quota error is never retried, unlike an ordinary rate limit", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    const requestBodies = mockChatSequence(page, [
      () => ({ status: 429, body: { error: { message: "You exceeded your current quota.", code: "insufficient_quota" } } }),
    ]);

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    const last = await lastTranscriptMessage(page);
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorInsufficientQuota")));
    assert.equal(requestBodies.length, 1, "expected exactly one attempt -- retrying a permanent quota error is pointless");
  });
});

// fetchOpenAiModels (the GET /v1/models call during connect) gets the same
// backoff treatment as the chat endpoint above -- a rate limit hit while
// just discovering models shouldn't be any less recoverable than one hit
// mid-conversation.
test("connecting retries a transient rate-limit on model discovery and succeeds once it recovers", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    const models = [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }];
    let callCount = 0;
    await page.route(MODELS_URL, (route) => {
      callCount++;
      if (callCount < 3) {
        route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: { message: "Rate limit reached", code: "rate_limit_exceeded" } }) });
        return;
      }
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ object: "list", data: models }) });
    });

    const expanded = await page.evaluate(() => window.__kg.agent.isExpanded());
    if (!expanded) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 15000 });

    assert.equal(callCount, 3, "expected the two failed attempts plus the eventual success");
    const modelOptions = await page.evaluate(() => Array.from(document.getElementById("agent-model-select-modal").options).map((o) => o.value));
    assert.deepEqual(modelOptions, ["gpt-4o-mini"]);
  });
});

test("a network/CORS failure shows a distinct chat error", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    await page.route(CHAT_URL, (route) => route.abort("failed"));

    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => !window.__kg.agent.isSending());
    const last = await lastTranscriptMessage(page);
    assert.equal(last.role, "system");
    assert.equal(last.text, await page.evaluate(() => window.__kg.lang.t("agentChatErrorNetwork")));
  });
});

test("disconnecting mid-conversation clears both the visible transcript and the API-facing message history", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);

    await page.click("#agent-disconnect");
    const state = await page.evaluate(() => ({
      transcript: window.__kg.agent.state.transcript.length,
      apiMessages: window.__kg.agent.state.apiMessages.length,
      sending: window.__kg.agent.isSending(),
    }));
    assert.deepEqual(state, { transcript: 0, apiMessages: 0, sending: false });
    const transcriptDom = await page.evaluate(() => document.getElementById("agent-transcript").children.length);
    assert.equal(transcriptDom, 0);
  });
});

test("reconnecting after a disconnect starts a fresh conversation", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply one") })]);
    await sendChatMessage(page, "hello");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    await page.click("#agent-disconnect");

    await connectAgent(page);
    mockChatSequence(page, [() => ({ body: chatCompletionBody("reply two") })]);
    await sendChatMessage(page, "hello again");
    await page.waitForFunction(() => window.__kg.agent.state.transcript.length === 2);
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.equal(transcript[0].text, "hello again");
    assert.equal(transcript[1].text, "reply two");
  });
});
