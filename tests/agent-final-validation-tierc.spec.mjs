import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// ISSUE #156 -- automatic end-of-interview Tier C (LLM second-opinion)
// call, triggered by get_graph_state({finalValidation:true}), bounded to
// at most once per conversation. Same mocking convention as
// tests/agent-self-correction.spec.mjs -- every model call is scripted
// through page.route(), no key, no network.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

const stateCall = (id, args = {}) => ({ id, type: "function", function: { name: "get_graph_state", arguments: JSON.stringify(args) } });
const toolTurn = (calls) => ({ role: "assistant", content: null, tool_calls: calls });
const textTurn = (text) => ({ role: "assistant", content: text });
const tierCJsonReply = (findings) => textTurn("```json\n" + JSON.stringify(findings) + "\n```");

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

// Request bodies accumulate the full conversation so far -- an earlier
// tool result reappears in every later request's own message history, so
// this must dedupe (same convention as tests/agent-self-correction.spec.mjs's
// own toolResults()), not just flatMap every body's tool-role messages.
const toolResults = (bodies) => bodies.flatMap((b) => b.messages.filter((m) => m.role === "tool").map((m) => m.content))
  .filter((v, i, all) => all.indexOf(v) === i);

test("get_graph_state without finalValidation never triggers the extra model call", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [toolTurn([stateCall("t1")]), textTurn("Checked.")]);
    assert.equal(bodies.length, 2, "only the turn's own two requests -- no extra Tier C call");
    assert.equal(/SECOND-OPINION/.test(toolResults(bodies)[0]), false);
  });
});

test("get_graph_state with finalValidation:true triggers one extra model call and surfaces its findings", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      toolTurn([stateCall("t1", { finalValidation: true })]),
      tierCJsonReply([{ check: "model-review", severity: "warning", subject: "closeIncident", message: "Verification cannot follow from the effect." }]),
      textTurn("Validated."),
    ]);
    assert.equal(bodies.length, 3, "the turn's own two requests plus one Tier C call");
    const result = toolResults(bodies)[0];
    assert.match(result, /SECOND-OPINION MODEL CHECK — 1 observation/);
    assert.match(result, /\[model-review\] Verification cannot follow from the effect\./);

    // And the system prompt of the middle (Tier C) request is the real,
    // shared CONSISTENCY_LLM_PROMPT -- not a second, drifted copy of it.
    const tierCRequest = bodies[1];
    assert.equal(tierCRequest.messages[0].role, "system");
    assert.match(tierCRequest.messages[0].content, /reviewing a domain model for internal contradictions/);
  });
});

test("a clean second-opinion check is reported as such, not silently omitted", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      toolTurn([stateCall("t1", { finalValidation: true })]),
      tierCJsonReply([]),
      textTurn("Validated."),
    ]);
    assert.match(toolResults(bodies)[0], /SECOND-OPINION MODEL CHECK — no additional observations\./);
  });
});

test("finalValidation:true runs the Tier C call at most once per conversation", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      toolTurn([stateCall("t1", { finalValidation: true })]),
      tierCJsonReply([{ check: "model-review", severity: "warning", subject: "x", message: "First pass finding." }]),
      toolTurn([stateCall("t2", { finalValidation: true })]), // re-validating after a fix
      textTurn("Re-validated."),
    ]);
    // Both get_graph_state calls happen inside the same user turn here (two
    // rounds of tool_calls): req0 initial, req1 Tier C, req2 continuation
    // (issues the 2nd get_graph_state), req3 final reply -- no 2nd Tier C request.
    const results = toolResults(bodies);
    assert.equal(results.length, 2, "two get_graph_state calls, two tool results");
    assert.match(results[0], /SECOND-OPINION MODEL CHECK — 1 observation/);
    assert.match(results[1], /SECOND-OPINION MODEL CHECK — already attempted once this conversation, not repeated\./,
      "the second finalValidation:true call must not spend a second real Tier C request, and must say so explicitly");
    // Only one Tier C-shaped request should have gone out in the whole turn.
    const tierCRequests = bodies.filter((b) => b.messages[0].role === "system" && /internal contradictions/.test(b.messages[0].content));
    assert.equal(tierCRequests.length, 1);
  });
});

test("a Tier C failure is reported plainly and still counts as run (no infinite retry)", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      toolTurn([stateCall("t1", { finalValidation: true })]),
      textTurn("not valid json at all"), // Tier C reply that fails to parse
      toolTurn([stateCall("t2", { finalValidation: true })]),
      textTurn("Done."),
    ]);
    const results = toolResults(bodies);
    assert.match(results[0], /SECOND-OPINION MODEL CHECK — could not be completed/);
    assert.match(results[1], /SECOND-OPINION MODEL CHECK — already attempted once this conversation, not repeated\./,
      "after a failed attempt, a later finalValidation:true call must not retry it -- 'ran' is set regardless of success");
  });
});

test("self-correction-disabled control arm never triggers Tier C either, matching every other #84 mechanism it builds on", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.agent.setSelfCorrectionDisabled(true));
    const bodies = await runAgentTurn(page, [toolTurn([stateCall("t1", { finalValidation: true })]), textTurn("Done.")]);
    assert.equal(bodies.length, 2, "no extra Tier C request in the control arm");
    assert.equal(/SECOND-OPINION/.test(toolResults(bodies)[0]), false);
  });
});
