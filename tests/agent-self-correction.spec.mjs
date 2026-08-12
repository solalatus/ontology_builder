import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// AGENT SELF-CORRECTION FROM THE CONSISTENCY CHECKER (issue #84)
//
// Every OpenAI call is mocked through page.route() — no key, no network, and
// the model's side of each turn is scripted, which is the only way to test
// "what does the agent get told, and what is it then allowed to do".

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

// A model with one deliberate contradiction: canClose requires a status value
// the property does not allow.
const BROKEN_YAML = `classes:
  Incident:
    properties:
      status:
        type: text
        allowed:
          - new
          - closed
rules:
  canClose:
    conditions:
      - Incident status is archived.
actions:
  close:
    input: Incident
    preconditions:
      - canClose
    effect: Incident status becomes closed.
    verification: Read it back.
`;
const FIX_YAML = `classes:
  Incident:
    properties:
      status:
        type: text
        allowed:
          - new
          - closed
          - archived
`;

const applyCall = (id, yaml) => ({ id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify({ yaml }) } });
const stateCall = (id) => ({ id, type: "function", function: { name: "get_graph_state", arguments: "{}" } });
const toolTurn = (calls) => ({ role: "assistant", content: null, tool_calls: calls });
const textTurn = (text) => ({ role: "assistant", content: text });

// Drives one real agent turn against a scripted sequence of model replies, and
// returns every request body the app sent — which is where the tool results it
// received can be read back.
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

// The tool results the app fed back, in order.
const toolResults = (bodies) => bodies.flatMap((b) => b.messages.filter((m) => m.role === "tool").map((m) => m.content))
  .filter((v, i, all) => all.indexOf(v) === i);

test("findings from the agent's own edit come back on the tool result", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [toolTurn([applyCall("t1", BROKEN_YAML)]), textTurn("Noted.")]);
    const [result] = toolResults(bodies);
    assert.match(result, /^Applied\./);
    assert.match(result, /CONSISTENCY CHECK — 1 new problem\(s\) from this edit/);
    assert.match(result, /\[error\] value-not-allowed/);
    assert.match(result, /"archived"/);
  });
});

test("a clean edit is told so, rather than being told nothing", async () => {
  await withPage(async (page) => {
    const clean = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\nrelationships:\n  - name: assignedTo\n    from: Incident\n    to: Engineer\n";
    const bodies = await runAgentTurn(page, [toolTurn([applyCall("t1", clean)]), textTurn("Done.")]);
    assert.match(toolResults(bodies)[0], /no new problems from this edit/);
  });
});

test("notes never reach the agent — an unfinished model must not look broken", async () => {
  // Three classes and one relationship: two of them are unconnected and the
  // rule is referenced by nothing, which is `note` territory and completely
  // normal at this stage of an interview.
  await withPage(async (page) => {
    const young = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\n  Alert:\n    properties: {}\nrelationships:\n  - name: assignedTo\n    from: Incident\n    to: Engineer\nrules:\n  someRule:\n    conditions:\n      - Something holds.\n";
    const bodies = await runAgentTurn(page, [toolTurn([applyCall("t1", young)]), textTurn("Done.")]);
    const result = toolResults(bodies)[0];
    assert.match(result, /no new problems from this edit/);
    assert.equal(/class-no-relationships|orphan-rule|\[note\]/.test(result), false);
    // The human still sees them.
    assert.ok((await page.evaluate(() => window.__kg.consistency.current())).some((f) => f.severity === "note"));
  });
});

test("the agent may commit up to three times in a turn, and the fourth is refused", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", BROKEN_YAML)]),
      toolTurn([applyCall("t2", "classes:\n  Extra:\n    properties: {}\n")]),
      toolTurn([applyCall("t3", "classes:\n  Extra2:\n    properties: {}\n")]),
      toolTurn([applyCall("t4", "classes:\n  Extra3:\n    properties: {}\n")]),
      textTurn("Finished."),
    ]);
    const results = toolResults(bodies);
    assert.equal(results.filter((r) => r.startsWith("Applied.")).length, 3, "exactly three commits should land");
    assert.match(results[results.length - 1], /no further apply_ontology_yaml call is available this turn/i);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.some((n) => n.label === "Extra3")), false);
  });
});

test("the extra applies are for remediation, not for more editing", async () => {
  // First edit is clean, so nothing is outstanding, so a second apply in the
  // same turn has no remediation to do and is refused.
  await withPage(async (page) => {
    const clean = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\nrelationships:\n  - name: assignedTo\n    from: Incident\n    to: Engineer\n";
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", clean)]),
      toolTurn([applyCall("t2", "classes:\n  Sneaky:\n    properties: {}\n")]),
      textTurn("Done."),
    ]);
    const results = toolResults(bodies);
    assert.equal(results.filter((r) => r.startsWith("Applied.")).length, 1);
    assert.match(results[results.length - 1], /not for further edits/);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.some((n) => n.label === "Sneaky")), false);
  });
});

test("a whole turn is one undo step, however many times it committed", async () => {
  // The property the old one-commit-per-turn rule existed to guarantee, now
  // preserved directly instead of by refusing to commit twice.
  await withPage(async (page) => {
    const before = await page.evaluate(() => window.__kg.history.past.length);
    await runAgentTurn(page, [
      toolTurn([applyCall("t1", BROKEN_YAML)]),
      toolTurn([applyCall("t2", FIX_YAML)]),
      textTurn("Fixed it."),
    ]);
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), before + 1,
      "two commits in one turn must leave exactly one undo entry");
    assert.ok(await page.evaluate(() => window.__kg.state.nodes.length) > 0);

    await page.evaluate(() => window.__kg.actions.undo());
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0,
      "undo must restore the state as it was before the agent's turn began");
  });
});

test("the folded entry is still one reviewable agent edit in Review changes", async () => {
  await withPage(async (page) => {
    await runAgentTurn(page, [
      toolTurn([applyCall("t1", BROKEN_YAML)]),
      toolTurn([applyCall("t2", FIX_YAML)]),
      textTurn("Fixed it."),
    ]);
    const entries = await page.evaluate(() => window.__kg.history.past.map((e) => ({ source: e.source, evidenceIndex: e.evidenceIndex })));
    assert.equal(entries.length, 1);
    assert.equal(entries[0].source, "agent-auto-edit");
    assert.equal(typeof entries[0].evidenceIndex, "number");
    await page.evaluate(() => window.__kg.reviewChanges.open());
    const diff = await page.evaluate(() => {
      const entry = window.__kg.history.past[0];
      return window.__kg.reviewChanges.computeSemanticDiff(entry.before, entry.after);
    });
    // The diff spans the whole turn: the class the first apply added, with the
    // allowed value the second apply corrected already in place.
    assert.equal(diff.classes.added.length, 1);
    await page.evaluate(() => window.__kg.reviewChanges.close());
  });
});

test("self-correction inside one turn actually clears the finding", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", BROKEN_YAML)]),
      toolTurn([applyCall("t2", FIX_YAML)]),
      textTurn("Fixed it."),
    ]);
    const results = toolResults(bodies);
    assert.match(results[0], /\[error\] value-not-allowed/);
    assert.match(results[1], /no new problems from this edit/);
    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.current().filter((f) => f.severity === "error")), []);
  });
});

test("pre-existing problems are counted, not re-listed", async () => {
  await withPage(async (page) => {
    // Land the contradiction first, by hand, so it is backlog rather than
    // something this turn introduced.
    await page.evaluate((yaml) => {
      window.__kg.formats.openImportDialog(yaml, "yaml");
      document.getElementById("import-replace").click();
    }, BROKEN_YAML);

    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", "classes:\n  Engineer:\n    properties: {}\n")]),
      textTurn("Added it."),
    ]);
    const result = toolResults(bodies)[0];
    assert.match(result, /1 pre-existing problem\(s\) remain unresolved/);
    assert.equal(/\[error\] value-not-allowed/.test(result), false,
      "the backlog is counted, not re-sent every turn");
  });
});

test("get_graph_state carries the full sweep, which is what Phase 9 reads", async () => {
  await withPage(async (page) => {
    await page.evaluate((yaml) => {
      window.__kg.formats.openImportDialog(yaml, "yaml");
      document.getElementById("import-replace").click();
    }, BROKEN_YAML);
    const bodies = await runAgentTurn(page, [toolTurn([stateCall("t1")]), textTurn("Checked.")]);
    const result = toolResults(bodies)[0];
    assert.match(result, /^classes:/m, "still the model export");
    assert.match(result, /# CONSISTENCY CHECK — 1 outstanding problem/);
    assert.match(result, /value-not-allowed/);
  });
});

test("a turn that leaves an error unresolved says so in the transcript", async () => {
  await withPage(async (page) => {
    await runAgentTurn(page, [toolTurn([applyCall("t1", BROKEN_YAML)]), textTurn("I'll leave that as is.")]);
    const transcript = await page.locator("#agent-transcript").textContent();
    assert.match(transcript, /left 1 consistency problem\(s\) unresolved/);
  });
});

test("a turn that leaves nothing unresolved stays quiet", async () => {
  await withPage(async (page) => {
    const clean = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\nrelationships:\n  - name: assignedTo\n    from: Incident\n    to: Engineer\n";
    await runAgentTurn(page, [toolTurn([applyCall("t1", clean)]), textTurn("Done.")]);
    assert.equal(/consistency problem/.test(await page.locator("#agent-transcript").textContent()), false);
  });
});
