import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// LIVE INTERVIEW AGENT — remove_ontology_elements (issue #140 follow-up)
//
// A manual, page-by-page audit of 15 real completed interviews (issue #140)
// found the interviewer's own system prompt already instructed it, in its
// CONSISTENCY CHECK section, to "resolve which direction the expert
// actually uses and remove the other" whenever an inverse-pair relationship
// warning fired — an instruction it had no way to actually carry out, since
// apply_ontology_yaml is upsert-only by design (it can create or field-patch,
// never clear/delete). The predictable, observed result: the interviewer
// instead overwrote a relationship's `meaning` with a self-directed deletion
// note ("REMOVE") that then shipped, untouched, in the final exported
// ontology. This file exercises the fix: the interviewer's tool loop now
// also accepts remove_ontology_elements, the exact same tool/removal core
// the Import Review execution agent already had (see
// tests/import-review-agent.spec.mjs for that side's own coverage).
//
// Every OpenAI call is mocked through page.route() — no key, no network —
// same convention as tests/agent-self-correction.spec.mjs, which this file
// mirrors closely for the shared apply/remove commit-budget mechanics.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

const applyCall = (id, yaml) => ({ id, type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify({ yaml }) } });
const removeCall = (id, args) => ({ id, type: "function", function: { name: "remove_ontology_elements", arguments: JSON.stringify(args) } });
const badArgsCall = (id, name, rawArgs) => ({ id, type: "function", function: { name, arguments: rawArgs } });
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

const toolResults = (bodies) => bodies.flatMap((b) => b.messages.filter((m) => m.role === "tool").map((m) => m.content))
  .filter((v, i, all) => all.indexOf(v) === i);

const SEED_YAML = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\nrelationships:\n  - name: assignedTo\n    from: Incident\n    to: Engineer\n";

async function seed(page, yaml = SEED_YAML) {
  await page.evaluate((y) => {
    window.__kg.formats.openImportDialog(y, "yaml");
    document.getElementById("import-replace").click();
  }, yaml);
}

test("the tools array on a live interview request includes remove_ontology_elements, third after apply and get_graph_state", async () => {
  await withPage(async (page) => {
    const bodies = await runAgentTurn(page, [textTurn("Understood.")], "Let's start.");
    const names = bodies[0].tools.map((t) => t.function.name);
    assert.deepEqual(names, ["apply_ontology_yaml", "get_graph_state", "remove_ontology_elements"]);
  });
});

test("a remove_ontology_elements call actually deletes a relationship, in exactly one undo step", async () => {
  await withPage(async (page) => {
    await seed(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);

    const bodies = await runAgentTurn(page, [
      toolTurn([removeCall("t1", { relationships: [{ name: "assignedTo", from: "Incident", to: "Engineer" }] })]),
      textTurn("Removed it."),
    ]);

    const edgeNames = await page.evaluate(() => window.__kg.state.edges.map((e) => e.relation));
    assert.deepEqual(edgeNames, [], "the relationship should be gone");

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter - historyBefore, 1, "the removal must cost exactly one undo step");

    const results = toolResults(bodies);
    assert.match(results[0], /^Removed 1 element\(s\)/);
    assert.match(results[0], /relationships: assignedTo \(Incident → Engineer\)/);

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const toolNote = transcript.find((m) => m.role === "tool");
    assert.match(toolNote.text, /Removed/);
  });
});

test("removing a class cascades to remove the relationships that reference it, same as the manual delete path", async () => {
  await withPage(async (page) => {
    await seed(page);
    await runAgentTurn(page, [
      toolTurn([removeCall("t1", { classes: ["Engineer"] })]),
      textTurn("Removed it."),
    ]);
    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.deepEqual(labels, ["Incident"]);
    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.deepEqual(edges, [], "the relationship pointing at the deleted class must also be gone");
  });
});

test("removing a property deletes only that property, leaving the rest of the class intact", async () => {
  await withPage(async (page) => {
    await seed(page, "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n      priority:\n        type: text\n");
    await runAgentTurn(page, [
      toolTurn([removeCall("t1", { properties: [{ className: "Incident", name: "status" }] })]),
      textTurn("Done."),
    ]);
    const props = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Incident").properties.map((p) => p.name));
    assert.deepEqual(props, ["priority"]);
  });
});

test("undo after a remove-only turn restores exactly what was removed", async () => {
  await withPage(async (page) => {
    await seed(page);
    await runAgentTurn(page, [
      toolTurn([removeCall("t1", { relationships: [{ name: "assignedTo", from: "Incident", to: "Engineer" }] })]),
      textTurn("Removed it."),
    ]);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 0);

    await page.evaluate(() => window.__kg.actions.undo());
    const edgeNames = await page.evaluate(() => window.__kg.state.edges.map((e) => e.relation));
    assert.deepEqual(edgeNames, ["assignedTo"], "undo should bring the removed relationship back");
  });
});

test("a remove call naming nothing that exists is reported as a no-op, not a silent success", async () => {
  await withPage(async (page) => {
    await seed(page);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    const bodies = await runAgentTurn(page, [
      toolTurn([removeCall("t1", { classes: ["NoSuchClass"] })]),
      textTurn("Hmm."),
    ]);
    assert.match(toolResults(bodies)[0], /Nothing was removed/);
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore, "a no-op removal must not create an undo entry");
  });
});

test("malformed remove_ontology_elements arguments are reported as an error, same as a malformed apply call", async () => {
  await withPage(async (page) => {
    await seed(page);
    const bodies = await runAgentTurn(page, [
      toolTurn([badArgsCall("t1", "remove_ontology_elements", "{not valid json")]),
      textTurn("Let me try that again."),
    ]);
    assert.match(toolResults(bodies)[0], /could not parse tool arguments as JSON/);
    assert.equal((await page.evaluate(() => window.__kg.state.edges)).length, 1, "nothing should have been touched");
  });
});

// --- shared per-turn commit budget with apply_ontology_yaml -----------------

test("after a clean apply with nothing to remediate, a same-turn remove call is refused, same budget rule as a second apply", async () => {
  await withPage(async (page) => {
    const clean = "classes:\n  Widget:\n    properties: {}\n";
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", clean)]),
      toolTurn([removeCall("t2", { classes: ["Widget"] })]),
      textTurn("Done."),
    ]);
    const results = toolResults(bodies);
    assert.equal(results.filter((r) => r.startsWith("Applied.") || r.startsWith("Removed")).length, 1);
    assert.match(results[results.length - 1], /no further apply_ontology_yaml or remove_ontology_elements call is available this turn/i);
    assert.ok(await page.evaluate(() => window.__kg.state.nodes.some((n) => n.label === "Widget")), "the refused remove call must not have touched anything");
  });
});

// The exact real-world shape the audit found: an apply that introduces an
// inverse-pair (reverse-direction duplicate) relationship warning, which the
// interviewer's own prompt says to resolve by removing one direction. Before
// this fix there was no tool that could do that in the same turn; now there
// is, and it should actually clear the finding.
test("self-correction can now use remove_ontology_elements to clear an inverse-pair finding in the same turn", async () => {
  await withPage(async (page) => {
    const introducesReversePair = "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\nrelationships:\n  - name: relatesTo\n    from: Incident\n    to: Engineer\n  - name: relatesTo\n    from: Engineer\n    to: Incident\n";
    const bodies = await runAgentTurn(page, [
      toolTurn([applyCall("t1", introducesReversePair)]),
      toolTurn([removeCall("t2", { relationships: [{ name: "relatesTo", from: "Engineer", to: "Incident" }] })]),
      textTurn("Kept the Incident-to-Engineer direction and removed the reverse."),
    ]);
    const results = toolResults(bodies);
    assert.match(results[0], /inverse-pair/, "the apply should have surfaced the reverse-direction warning");
    assert.match(results[1], /^Removed 1 element\(s\)/);
    const findings = await page.evaluate(() => window.__kg.consistency.current());
    assert.deepEqual(findings.filter((f) => f.check === "inverse-pair"), [], "removing one direction must actually clear the warning, not just narrate resolving it");

    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(historyAfter, 1, "the apply and the remediating remove must fold into one undo step");
  });
});
