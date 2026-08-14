import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, APP_URL } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// Competency Questions — the Helper Agent half (issue #94 §10-§13).
//
// The methodology change is the point of the whole issue: Phase 1's real
// questions stop being conversation-only and become persisted requirements,
// and Phase 9 grades the model against the persisted list rather than against
// the agent's own memory of a conversation that may have been compacted,
// restarted, or edited on the canvas since.
//
// Prompt assertions are cheap and direct (buildAgentSystemPrompt() needs no
// connection); the two behavioural tests at the bottom drive the real tool
// surface with a mocked API.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

async function systemPrompt(page) {
  return page.evaluate(() => window.__kg.agent.buildSystemPrompt());
}

function mockModelsRoute(page) {
  return page.route(MODELS_URL, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
  }));
}

function mockChatSequence(page, responders) {
  const requestBodies = [];
  let callIndex = 0;
  page.route(CHAT_URL, (route) => {
    requestBodies.push(route.request().postDataJSON());
    const responder = responders[Math.min(callIndex, responders.length - 1)];
    callIndex++;
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(responder()) });
  });
  return requestBodies;
}

const assistantReply = (text) => ({
  id: "chatcmpl-test", object: "chat.completion",
  choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }],
});

const toolCallReply = (id, yaml) => ({
  id: "chatcmpl-test", object: "chat.completion",
  choices: [{
    index: 0,
    message: {
      role: "assistant", content: null,
      tool_calls: [{ id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify({ yaml }) } }],
    },
    finish_reason: "tool_calls",
  }],
});

// A mocked 400 is a real failed fetch, and Chromium logs one as a resource
// error regardless of the app handling it correctly — the same allowance
// tests/helper-agent-phase2.spec.mjs already makes for its own compaction
// tests, for the same reason.
async function withPageAllowingResourceErrors(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  await page.evaluate(() => window.__kg.welcome.close());
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  const unexpected = consoleErrors.filter((m) => !/Failed to load resource/.test(m));
  assert.deepEqual(unexpected, [], "expected no console/page errors other than a mocked fetch failure's own resource-load log");
}

async function connectAgent(page) {
  await mockModelsRoute(page);
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

test("the system prompt defines what a competency question is, in the future-agent sense", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /A COMPETENCY QUESTION \(CQ\)\s*is a real question the future domain agent must be able to answer, or\s*have enough domain orientation to work out how to answer/);
    // The distinction the whole feature rests on: a CQ is a requirement on
    // the ontology, not a query against stored instance data.
    assert.match(prompt, /It is a\s*requirement on the ontology, not a query against stored data/);
  });
});

test("Phase 1 defers modeling and requires confirmed competency questions to be persisted", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Do not create classes, relationships, properties, rules, or actions yet\.\s*First establish the competency questions and required actions\./);
    assert.match(prompt, /A CQ is not accepted merely because you proposed it: confirm it with the\s*expert/);
    assert.match(prompt, /persist it using\s*competency_questions in apply_ontology_yaml/);
    // The old wording promised only that nothing would be modelled yet; it
    // said nothing about the questions themselves surviving the conversation.
    assert.doesNotMatch(prompt, /just collect these verbatim/);
  });
});

test("Phase 1 normalizes compound and instance-specific questions, without an approval loop", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /split clearly compound questions into atomic\s*questions/);
    assert.match(prompt, /avoid one-off instance wording where the intended\s*requirement is general/);
    assert.match(prompt, /one\s*confirmation turn per question is not required/,
      "batching is explicitly allowed — the issue rules out a per-question ceremony");
  });
});

// Caught in review of this very issue's first draft: the Phase 1 wording
// illustrated "avoid one-off instance wording" with a worked example borrowed
// straight from IT operations ("which escalation policy applies to a support
// request of this severity"). GROUND RULES forbids exactly that — the tool is
// domain-general, and the interviewer is told never to reach for one field's
// vocabulary for its own examples. It is also the domain of this repository's
// own eval fixture, so the wording would have leaked fixture vocabulary into
// the interviewer being scored against that fixture. Pinned here so a future
// edit cannot quietly reintroduce it.
test("the competency-question wording uses abstract placeholders, never a borrowed domain's vocabulary", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /ask "which \[Role X\] should handle a \[Class A\]\s*of this kind\?"/);
    // The GROUND RULES entry these examples have to obey is still stated.
    assert.match(prompt, /general-purpose ontology-building tool for ANY domain/);
    // Scoped to the INTERVIEW PROCESS section alone. The baked knowledge
    // block after it is a different thing entirely — a reference document
    // with its own worked invoice example, which GROUND RULES governs the
    // *interviewer's* behaviour around rather than forbidding outright.
    const processSection = prompt.slice(
      prompt.indexOf("INTERVIEW PROCESS"),
      prompt.indexOf("SCOPE (this agent is embedded"),
    );
    assert.ok(processSection.length > 1000, "failed to isolate the interview-process section");
    // Spot-check the vocabulary of this repo's own eval fixture specifically:
    // an interviewer primed with it would score against that fixture unfairly.
    for (const borrowed of ["escalation policy", "support request", "incident", "invoice", "severity"]) {
      assert.doesNotMatch(processSection, new RegExp(borrowed, "i"),
        `the interview process must not name "${borrowed}" — that is one domain's vocabulary`);
    }
  });
});

test("Phase 0 recognizes already-present competency questions instead of regenerating them", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /If it already contains\s*competency_questions/);
    assert.match(prompt, /do NOT discard them and do NOT immediately generate\s*a fresh set of your own/);
    assert.match(prompt, /ask whether to use\s*them as the accepted starting requirements or review them together\s*first/,
      "both intended workflows — accept imported CQs, or refine them — have to stay open");
  });
});

test("Phase 9 reads the persisted competency questions back from get_graph_state", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /call get_graph_state and read the persisted\s*competency_questions from that result/);
    assert.match(prompt, /do NOT work from your own\s*memory of what was asked in Phase 1/);
    assert.match(prompt, /may have been compacted,\s*restarted or edited on the canvas since/);
    assert.match(prompt, /If the persisted list is empty, say so\s*plainly/,
      "an ontology with no recorded CQs has no acceptance test — inventing one to grade against would be worse than saying so");
  });
});

test("the documented tool YAML shape includes competency_questions", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /competency_questions:\n {2}- id: <omit for a new question; use the exact existing id to reword one>\n {4}text:/);
    assert.ok(prompt.indexOf("competency_questions:\n  - id: <omit") < prompt.indexOf("classes:\n  ClassName:"),
      "the shape lists requirements before the model that answers them, same as the export");
  });
});

test("context compaction is instructed to preserve the confirmed competency questions verbatim", async () => {
  await withPageAllowingResourceErrors(async (page) => {
    await connectAgent(page);
    // Force a compaction: the first chat call fails with context_length, so
    // the app summarizes the older history and retries. The summarization
    // call's own system message is what this test is about. Prior turns are
    // seeded first — with nothing older than the keep-recent window there is
    // nothing to summarize, and compaction bails out instead of running.
    await page.evaluate(() => {
      for (let i = 0; i < 4; i++) {
        window.__kg.agent.state.apiMessages.push({ role: "user", content: `prior user turn ${i}` });
        window.__kg.agent.state.apiMessages.push({ role: "assistant", content: `prior assistant turn ${i}` });
      }
    });
    let firstChat = true;
    const bodies = [];
    await page.route(CHAT_URL, (route) => {
      const body = route.request().postDataJSON();
      bodies.push(body);
      if (firstChat) {
        firstChat = false;
        return route.fulfill({
          status: 400, contentType: "application/json",
          body: JSON.stringify({ error: { message: "maximum context length", type: "invalid_request_error", code: "context_length_exceeded" } }),
        });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(assistantReply("Summary or reply.")) });
    });

    await page.fill("#agent-chat-input", "Here is my domain.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const summarization = bodies.find((b) => b.messages.some((m) =>
      m.role === "system" && typeof m.content === "string" && m.content.includes("Summarize the following")));
    assert.ok(summarization, "a context-length failure must trigger a summarization call");
    assert.match(summarization.messages[0].content, /confirmed\s+competency questions \(verbatim/,
      "a summary that drops the acceptance test makes Phase 9 ungradable after a compaction");
  });
});

test("apply_ontology_yaml accepts the new section end to end, and reports it as applied", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => toolCallReply("call_1", [
        "competency_questions:",
        "  - text: Which escalation policy applies to this support request?",
        "  - text: What evidence is required before the request can be closed?",
        "",
      ].join("\n")),
      () => assistantReply("Recorded both questions. Anything else the agent must answer?"),
    ]);

    await page.fill("#agent-chat-input", "Those are the two questions that matter.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    assert.deepEqual(
      await page.evaluate(() => window.__kg.state.competencyQuestions.map((cq) => cq.text)),
      [
        "Which escalation policy applies to this support request?",
        "What evidence is required before the request can be closed?",
      ],
      "a confirmed competency question has to survive the conversation that produced it",
    );
    // Visible to the user as a real edit, and undoable like any other.
    assert.match(await page.locator("#agent-transcript").textContent(), /Applied: 2 added/);
    await page.click("#btn-undo");
    assert.deepEqual(await page.evaluate(() => window.__kg.state.competencyQuestions), []);
  });
});

test("get_graph_state hands the agent the persisted competency questions, so Phase 9 can grade against them", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await page.evaluate(() => window.__kg.actions.createCompetencyQuestion("Which escalation policy applies?"));

    const bodies = [];
    let served = false;
    await page.route(CHAT_URL, (route) => {
      bodies.push(route.request().postDataJSON());
      if (!served) {
        served = true;
        return route.fulfill({
          status: 200, contentType: "application/json",
          body: JSON.stringify({
            id: "chatcmpl-test", object: "chat.completion",
            choices: [{
              index: 0,
              message: {
                role: "assistant", content: null,
                tool_calls: [{ id: "call_state", type: "function", function: { name: "get_graph_state", arguments: "{}" } }],
              },
              finish_reason: "tool_calls",
            }],
          }),
        });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(assistantReply("Replaying the questions now.")) });
    });

    await page.fill("#agent-chat-input", "Let's do the final validation pass.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const toolResult = bodies.at(-1).messages.find((m) => m.role === "tool");
    assert.ok(toolResult, "the follow-up request carries the tool result");
    assert.match(toolResult.content, /competency_questions:/);
    assert.match(toolResult.content, /Which escalation policy applies\?/);
  });
});

// Caught by a live run of this issue's own non-regression evaluation, not by
// reading the code: the interviewer sent four consecutive relationship-only
// apply_ontology_yaml calls whose endpoint classes it had never declared, was
// told "Nothing to apply — no new or changed ... were found in that yaml"
// every time, and spent thirteen turns building an ontology that stayed
// completely empty. The message was simply false — the relationships WERE
// found, and were dropped for a specific, fixable reason the agent was never
// told. Issue #83 fixed exactly this truthfulness problem for the path where
// something else did apply, but its fix never reached this early return.
test("a call whose every relationship is dropped tells the agent why, instead of claiming nothing was found", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      () => toolCallReply("call_1", [
        "relationships:",
        "  - name: owns",
        "    from: ServiceOwner",
        "    to: ITService",
        "",
      ].join("\n")),
      () => assistantReply("Understood — I'll declare the classes first."),
    ]);

    const bodies = [];
    page.on("request", (req) => { if (req.url() === CHAT_URL) bodies.push(req.postDataJSON()); });
    await page.fill("#agent-chat-input", "Service owners own IT services.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const toolResult = bodies.at(-1).messages.find((m) => m.role === "tool");
    assert.ok(toolResult, "the follow-up request carries the tool result");
    assert.doesNotMatch(toolResult.content, /no new or changed .* were found in that yaml/,
      "claiming nothing was found is false — the relationship was found and then dropped");
    assert.match(toolResult.content, /1 relationship\(s\) were NOT stored because a class they connect does not exist/);
    assert.match(toolResult.content, /ServiceOwner --owns--> ITService/);
    assert.match(toolResult.content, /Add the missing class first/,
      "the agent needs the corrective action, not just the diagnosis");
    assert.deepEqual(await page.evaluate(() => window.__kg.state.edges), [],
      "and nothing may actually land on the canvas");
  });
});

// The genuinely-empty case must keep its original wording: a call that really
// carries nothing new is not the same event as one whose contents were
// dropped, and collapsing the two would trade one misleading message for
// another.
test("a call that really contains nothing new still says so plainly", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    mockChatSequence(page, [
      // A document with every section present and every section empty. Note
      // that re-sending an entry that already exists is NOT this case — that
      // counts as `changed` and applies, which is existing behaviour and
      // deliberately left alone.
      () => toolCallReply("call_1", "classes: {}\nrelationships: []\nrules: {}\nactions: {}\n"),
      () => assistantReply("Nothing new to record."),
    ]);

    const bodies = [];
    page.on("request", (req) => { if (req.url() === CHAT_URL) bodies.push(req.postDataJSON()); });
    await page.fill("#agent-chat-input", "Nothing new for now.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => !window.__kg.agent.isSending());

    const toolResult = bodies.at(-1).messages.find((m) => m.role === "tool");
    assert.match(toolResult.content, /Nothing to apply/);
    assert.doesNotMatch(toolResult.content, /were NOT stored/);
  });
});
