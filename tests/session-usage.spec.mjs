import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, waitForDownloads } from "./lib/page.mjs";

// Issue #177: every model call's `usage` is recorded with its kind, model
// and provider, kept with the conversation (reload, restart, disconnect),
// and exported in the session bundle with totals per call kind. Mocked
// OpenAI throughout: no key, no network.

const CHAT_URL = "https://api.openai.com/v1/chat/completions";

async function withUsagePage(fn) {
  const browser = await launchChromium();
  // browser.newPage, not newContext().newPage: the latter reports every
  // download's suggested name as "download".
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  // English, so the untitled graph's file names are ASCII: this sandbox's
  // headless Chromium reports any non-ASCII download name as "download"
  // (see tests/filename-sanitization.spec.mjs).
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  await page.evaluate(() => window.__kg.welcome.close());
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(errors, [], "no page errors");
}

async function connect(page) {
  await page.route("https://api.openai.com/v1/models", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
  }));
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key-0123456789abcdef");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

/** Serves the given responses to chat calls, in order (the last one repeats). */
async function serveChat(page, responses) {
  let i = 0;
  await page.unroute(CHAT_URL).catch(() => {});
  await page.route(CHAT_URL, (route) => {
    const r = responses[Math.min(i, responses.length - 1)];
    i += 1;
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(r) });
  });
}

const usage = (prompt, cached, cacheWrite, completion, reasoning) => ({
  prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion,
  prompt_tokens_details: { cached_tokens: cached, cache_write_tokens: cacheWrite },
  completion_tokens_details: { reasoning_tokens: reasoning },
});
const reply = (content, u, extra = {}) => ({
  model: "gpt-4o-mini-2024-07-18",
  choices: [{ index: 0, message: { role: "assistant", content, ...extra }, finish_reason: extra.tool_calls ? "tool_calls" : "stop" }],
  ...(u ? { usage: u } : {}),
});
const toolCall = { tool_calls: [{ id: "t1", type: "function", function: { name: "get_graph_state", arguments: "{}" } }] };

async function sendChat(page, text) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
  await page.waitForFunction(() => !window.__kg.agent.isSending());
}

async function exportBundle(page, downloads) {
  const before = downloads.length;
  await page.click("#btn-save-version");
  await page.click("#export-whole-session");
  await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
  await waitForDownloads(downloads, before + 4);
  const dl = downloads.slice(before).find((d) => d.suggestedFilename().endsWith(".session.json"));
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const MODEL_YAML = [
  "competency_questions:",
  "  - text: Which escalation policy applies to this support request?",
  "classes:",
  "  SupportRequest: {}",
  "  EscalationPolicy: {}",
  "relationships:",
  "  - name: escalatesUnder",
  "    from: SupportRequest",
  "    to: EscalationPolicy",
  "",
].join("\n");

test("every call is recorded with its kind, model, served model and provider, and the bundle totals them per kind", async () => {
  await withUsagePage(async (page, downloads) => {
    await connect(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), MODEL_YAML);

    // An interview turn with one tool round: two interview calls.
    await serveChat(page, [
      reply(null, usage(1000, 0, 1000, 50, 20), toolCall),
      reply("Done.", usage(1200, 1000, 200, 80, 30)),
    ]);
    await sendChat(page, "hello");
    // The model-based contradiction check and the coverage check.
    await serveChat(page, [reply("```json\n[]\n```", usage(500, 0, 0, 10, 5))]);
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await serveChat(page, [reply("```json\n[]\n```", usage(700, 400, 0, 40, 10))]);
    await page.evaluate(() => window.__kg.consistency.cqCoverage.run());
    await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());

    const recorded = await page.evaluate(() => window.__kg.agent.state.usage);
    assert.deepEqual(recorded.map((e) => e.kind), ["interview", "interview", "consistency_llm", "cq_coverage"]);
    for (const e of recorded) {
      assert.equal(e.model, "gpt-4o-mini");
      assert.equal(e.served_model, "gpt-4o-mini-2024-07-18");
      assert.equal(e.provider, "openai");
      assert.match(e.at, /^\d{4}-\d{2}-\d{2}T/);
    }
    assert.deepEqual(recorded[1].usage, usage(1200, 1000, 200, 80, 30), "the usage object, verbatim");

    const bundle = await exportBundle(page, downloads);
    assert.equal(bundle.format_version, 1, "additive field, same format version");
    assert.equal(bundle.usage.calls.length, 4);
    assert.deepEqual(bundle.usage.totals.by_kind.interview, {
      calls: 2, calls_with_usage: 2, prompt_tokens: 2200, cached_tokens: 1000, cache_write_tokens: 1200,
      completion_tokens: 130, reasoning_tokens: 50, cache_hit_share: 1000 / 2200,
    });
    assert.deepEqual(Object.keys(bundle.usage.totals.by_kind), ["consistency_llm", "cq_coverage", "interview"]);
    const all = bundle.usage.totals.all;
    assert.equal(all.calls, 4);
    assert.equal(all.prompt_tokens, 3400);
    assert.equal(all.cached_tokens, 1400);
    assert.equal(all.reasoning_tokens, 65);
    assert.equal(all.cache_hit_share, 1400 / 3400);
    assert.ok(!JSON.stringify(bundle).includes("sk-test-key-0123456789abcdef"), "the key never reaches the bundle");
  });
});

test("a response without usage, or with partial details, is recorded as null rather than failing", async () => {
  await withUsagePage(async (page, downloads) => {
    await connect(page);
    await serveChat(page, [reply("one", null)]);
    await sendChat(page, "first");
    await serveChat(page, [reply("two", { prompt_tokens: 300, completion_tokens: 20 })]);
    await sendChat(page, "second");

    const recorded = await page.evaluate(() => window.__kg.agent.state.usage);
    assert.equal(recorded.length, 2);
    assert.equal(recorded[0].usage, null);
    const bundle = await exportBundle(page, downloads);
    assert.deepEqual(bundle.usage.totals.by_kind.interview, {
      calls: 2, calls_with_usage: 1, prompt_tokens: 300, cached_tokens: null, cache_write_tokens: null,
      completion_tokens: 20, reasoning_tokens: null, cache_hit_share: null,
    });
  });
});

test("a bundle with no model calls carries an empty usage section", async () => {
  await withUsagePage(async (page, downloads) => {
    const bundle = await exportBundle(page, downloads);
    assert.deepEqual(bundle.usage.calls, []);
    assert.equal(bundle.usage.totals.all.calls, 0);
    assert.equal(bundle.usage.totals.all.prompt_tokens, null);
    assert.deepEqual(bundle.usage.totals.by_kind, {});
  });
});

test("usage survives a reload, and Restart Conversation starts a new log, persisted too", async () => {
  await withUsagePage(async (page, downloads) => {
    await connect(page);
    await serveChat(page, [reply("hi", usage(400, 0, 400, 10, 0))]);
    await sendChat(page, "hello");
    await page.evaluate(() => window.__kg.agent.whenConversationSaveIdle());
    const before = await page.evaluate(() => window.__kg.agent.state.usage);
    assert.equal(before.length, 1);

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => window.__kg.agent.loadConversationFromStorage());
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.state.usage), before, "restored after reload");

    await connect(page);
    await page.click("#agent-restart-conversation");
    await page.click("#confirm-ok");
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.state.usage), [], "restart clears it, like the transcript");
    await serveChat(page, [reply("new", usage(100, 0, 100, 5, 0))]);
    await sendChat(page, "fresh start");
    await page.evaluate(() => window.__kg.agent.whenConversationSaveIdle());
    const bundle = await exportBundle(page, downloads);
    assert.equal(bundle.usage.calls.length, 1, "only the new conversation's call");
    assert.equal(bundle.usage.calls[0].usage.prompt_tokens, 100);

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => window.__kg.agent.loadConversationFromStorage());
    assert.equal((await page.evaluate(() => window.__kg.agent.state.usage)).length, 1, "the cleared log stays cleared");
  });
});

test("a call still in flight when the conversation is restarted is not added to the new log", async () => {
  await withUsagePage(async (page) => {
    await connect(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), MODEL_YAML);
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route(CHAT_URL, async (route) => {
      await gate;
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(reply("```json\n[]\n```", usage(700, 0, 0, 10, 0))) });
    });
    const running = page.evaluate(() => window.__kg.consistency.cqCoverage.run());
    await page.waitForFunction(() => window.__kg.consistency.cqCoverage.isPending());
    await page.evaluate(() => window.__kg.agent.restartConversation());
    release();
    await running;
    await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.state.usage), []);
  });
});

test("disconnecting clears the usage log, like the transcript", async () => {
  await withUsagePage(async (page) => {
    await connect(page);
    await serveChat(page, [reply("hi", usage(10, 0, 0, 1, 0))]);
    await sendChat(page, "hello");
    assert.equal((await page.evaluate(() => window.__kg.agent.state.usage)).length, 1);
    await page.evaluate(() => window.__kg.agent.disconnect());
    assert.deepEqual(await page.evaluate(() => window.__kg.agent.state.usage), []);
  });
});
