import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { withPage } from "./lib/page.mjs";

// HARD REGRESSION GUARDS ON THE PRODUCTION INTERVIEWER (issue #75 §1)
//
// The post-interview structural normalization experiment (issue #75,
// tests/evals/post-normalization.mjs) is an *eval-only* condition: it must be
// possible to state, and to check mechanically, that the shipped interviewer
// did not change while it ran. These are the checks. They are in the default
// suite, not under tests/evals/, because the invariant they protect is a
// property of the production app rather than of the experiment -- it should
// fail on an ordinary CI run, not only when someone remembers to run the evals.
//
// Both assertions are offline: no API key, no network, no model call.
//
// WHEN THIS FAILS
// ---------------
// A failure here means the interviewer's system prompt or its tool surface
// changed. That is not automatically wrong -- the prompt is legitimately
// evolved over time -- but it is never a formality:
//
//   * Any intentional change makes a NEW TREATMENT. The eval's anchor
//     distribution (tests/evals/results/runs/run-01..03) was produced under the
//     prompt whose hash is below; comparing a later interview against those
//     three runs is only meaningful if the prompt matched, so an intentional
//     change needs a fresh non-regression evaluation before its numbers are
//     compared to anything (EXPERIMENT_BRIEF.md §4.3, issue #75 §17).
//   * If the change was NOT intentional, do not update the constants to make
//     the test pass. Issue #75 §1 says this in as many words: "Do not update
//     the golden hash to accommodate an accidental prompt change." Revert the
//     prompt instead.
//
// So: update the hash below in the same commit that deliberately changes the
// prompt, say so in the commit message, and re-run the anchor evaluation.

// SHA-256 of window.__kg.agent.buildSystemPrompt() -- AGENT_SYSTEM_PROMPT_BASE
// + AGENT_KNOWLEDGE + the output-language directive, exactly as sent to the
// model on a real request. Recorded per language because the directive names
// the language (agentLanguageDirective()), so the two differ by design.
export const PRODUCTION_SYSTEM_PROMPT_SHA256 = {
  en: "3554cef37978da3cf8eeef502182fd722e229d881260e7324cf4e6a75a2c173f",
  hu: "e484350e1e111505d949b89c3218bb8040c99fca2e09c2e95c6518940e8775f5",
};

// The complete ontology tool surface an ordinary interview request exposes.
// Issue #75 §1: an interview must expose exactly these two and no
// normalization tool. Order matters here on purpose -- it is the order the app
// sends, and pinning it means the assertion fails on a reordering too, which
// is the cheapest way to notice that this array was edited at all.
export const PRODUCTION_TOOL_NAMES = ["apply_ontology_yaml", "get_graph_state"];

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

for (const lang of ["en", "hu"]) {
  test(`production interviewer system prompt is byte-identical to the recorded ${lang} golden hash`, async () => {
    await withPage(async (page) => {
      const prompt = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      assert.equal(
        sha256(prompt), PRODUCTION_SYSTEM_PROMPT_SHA256[lang],
        `the production interviewer prompt (${lang}) changed -- see this file's header before touching the constant`
      );
    }, { lang });
  });
}

test("an ordinary interview request exposes exactly the two ontology tools, and no normalization tool", async () => {
  await withPage(async (page) => {
    await page.route(MODELS_URL, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }] }),
    }));

    // Captures the real outgoing request body rather than reading a constant
    // out of the page: what matters is the tool list the app actually sends on
    // a live interview turn, which is assembled at call time in
    // sendAgentChatMessage() and is not otherwise observable.
    const requestBodies = [];
    await page.route(CHAT_URL, (route) => {
      requestBodies.push(route.request().postDataJSON());
      route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          id: "chatcmpl-test", object: "chat.completion",
          choices: [{ index: 0, message: { role: "assistant", content: "Understood." }, finish_reason: "stop" }],
        }),
      });
    });

    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.fill("#agent-chat-input", "Let's start the interview.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => window.__kg.agent.isSending() === false);

    assert.equal(requestBodies.length, 1, "expected exactly one chat request for one user turn");
    const tools = requestBodies[0].tools || [];
    assert.deepEqual(
      tools.map((t) => t.function.name), PRODUCTION_TOOL_NAMES,
      "the interviewer's tool surface changed -- see this file's header before touching the constant"
    );
    assert.equal(
      tools.some((t) => /normal/i.test(t.function.name)), false,
      "a normalization tool is reachable from an ordinary interview request; issue #75 requires normalization to stay outside the interviewer"
    );

    // The system message the app actually sends must be the same prompt the
    // hash tests above pin -- otherwise the two guards could pass while a
    // different prompt went out on the wire.
    const systemMessage = requestBodies[0].messages.find((m) => m.role === "system");
    assert.equal(sha256(systemMessage.content), PRODUCTION_SYSTEM_PROMPT_SHA256.en);
  });
});
