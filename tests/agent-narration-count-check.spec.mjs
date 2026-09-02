import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// NARRATION-COUNT OVERCLAIM CHECK (issue #157)
//
// handleAgentApplyToolCall's tool result is already truthful (issue #83) --
// this guards the separate, later problem: the interviewer's own subsequent
// natural-language reply to the expert sometimes claims a bigger "recorded
// all N" total than what actually landed. Every model call is mocked
// through page.route(), same convention as agent-self-correction.spec.mjs.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

const applyCall = (id, yaml) => ({ id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify({ yaml }) } });
const toolTurn = (calls) => ({ role: "assistant", content: null, tool_calls: calls });
const textTurn = (text) => ({ role: "assistant", content: text });

async function runAgentTurn(page, replies, userText = "Go ahead.") {
  const bodies = [];
  let index = 0;
  await page.route(MODELS_URL, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
  }));
  await page.route(CHAT_URL, (route) => {
    bodies.push(route.request().postDataJSON());
    const message = replies[Math.min(index, replies.length - 1)];
    index++;
    route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ choices: [{ index: 0, message, finish_reason: message.tool_calls ? "tool_calls" : "stop" }] }),
    });
  });

  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);

  await page.fill("#agent-chat-input", userText);
  await page.click("#agent-chat-send");
  await page.waitForFunction(() => window.__kg.agent.isSending() === false);
  return bodies;
}

const userMessages = (bodies) => bodies.flatMap((b) => b.messages.filter((m) => m.role === "user").map((m) => m.content));

test("findNarrationCountOverclaim: flags an explicit over-total 'all N' claim", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.findNarrationCountOverclaim(
      "Great, I've recorded all 12 of those for you.", 2, 1,
    ));
    assert.deepEqual(result, { claimed: 12, trueTotal: 3 });
  });
});

test("findNarrationCountOverclaim: an accurate 'all N' claim is not flagged", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.findNarrationCountOverclaim(
      "Recorded all 3 of those.", 2, 1,
    ));
    assert.equal(result, null);
  });
});

test("findNarrationCountOverclaim: an itemized/partial claim is not a totalizing claim", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => window.__kg.agent.findNarrationCountOverclaim(
      "I recorded 3 of the 5 we discussed; the other two need more detail.", 1, 0,
    ));
    assert.equal(result, null, "no bare 'all N' phrase appears, so this is not flagged");
  });
});

test("findNarrationCountOverclaim: no text and no true total both degrade safely", async () => {
  await withPage(async (page) => {
    assert.equal(await page.evaluate(() => window.__kg.agent.findNarrationCountOverclaim("", 0, 0)), null);
    assert.equal(await page.evaluate(() => window.__kg.agent.findNarrationCountOverclaim(null, 5, 5)), null);
    // "all 4" with a true total of 0 (nothing applied) is still only ever
    // reachable in the wired-in turn loop when something WAS applied --
    // covered by the live-turn test below, not here.
  });
});

test("a live turn's overclaiming reply is surfaced and fed back to the agent", async () => {
  await withPage(async (page) => {
    const small = "classes:\n  Incident:\n    properties: {}\n";
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", small)]),
      textTurn("Perfect — I've recorded all 12 of the items we covered."),
    ]);
    // Transcript shows the mismatch to a human reading the panel.
    const transcript = await page.locator("#agent-transcript").textContent();
    assert.match(transcript, /said "all 12".*actually added 1 and updated 0/s);

    // The correction is queued for the model to see on its next request --
    // this single-turn test has no further turn to actually send it in, so
    // it's read back from the client-side conversation state directly
    // (bodies only ever captures requests actually made this turn).
    const apiMessages = await page.evaluate(() => window.__kg.agent.state.apiMessages);
    const notes = apiMessages
      .filter((m) => m.role === "user" && typeof m.content === "string" && m.content.startsWith("[System note]"));
    assert.equal(notes.length, 1);
    assert.match(notes[0].content, /said "all 12"/);
    assert.match(notes[0].content, /actually recorded 1 added and 0 updated item\(s\) — not 12/);
  });
});

test("a live turn's accurate reply draws no note", async () => {
  await withPage(async (page) => {
    const small = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\n";
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", small)]),
      textTurn("Recorded all 2 of those."),
    ]);
    const transcript = await page.locator("#agent-transcript").textContent();
    assert.equal(/actually added/.test(transcript), false);
    assert.equal(userMessages(bodies).some((c) => typeof c === "string" && c.startsWith("[System note]")), false);
  });
});

test("a reply that mentions an unrelated 'all N' when nothing was applied is not flagged", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      textTurn("Sure — before we go further, does this apply to all 12 branches, or just this one?"),
    ]);
    const transcript = await page.locator("#agent-transcript").textContent();
    assert.equal(/actually added/.test(transcript), false);
    assert.equal(userMessages(bodies).some((c) => typeof c === "string" && c.startsWith("[System note]")), false);
  });
});
