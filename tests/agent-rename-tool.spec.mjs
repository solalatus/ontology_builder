import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// rename_ontology_elements (issue #180's naming pass; on every interview since
// #187, whose prompt asks for the expert's own term at confirmation time):
// renames classes, relationships and properties in place,
// keeps previous class and relationship names as aliases, can turn a
// relationship round, does not draw on the per-turn edit budget, and folds
// into the turn's one undo step. Mocked: no key, no network.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

const SEED = [
  "classes:",
  "  Source:",
  "    properties:",
  "      currentLevel:",
  "        type: number",
  "  Sink: {}",
  "relationships:",
  "  - name: connectsTo",
  "    from: Source",
  "    to: Sink",
  "",
].join("\n");

const textBody = (content) => ({ id: "c", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }] });
const toolCall = (id, name, args) => ({ id, type: "function", function: { name, arguments: JSON.stringify(args) } });
const toolBody = (calls) => ({ id: "c", object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: calls }, finish_reason: "tool_calls" }] });

function mockChatSequence(page, bodies) {
  const requests = [];
  page.route(CHAT_URL, (route) => {
    requests.push(route.request().postDataJSON());
    const body = bodies[Math.min(requests.length - 1, bodies.length - 1)];
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return requests;
}

async function connect(page) {
  await page.route(MODELS_URL, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1715000000, object: "model" }] }),
  }));
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

async function send(page, text) {
  await page.fill("#agent-chat-input", text);
  await page.click("#agent-chat-send");
  await page.waitForFunction(() => !window.__kg.agent.isSending());
}

const toolNames = (body) => (body.tools || []).map((t) => t.function.name);

const graph = (page) => page.evaluate(() => {
  const label = (id) => window.__kg.state.nodes.find((n) => n.id === id).label;
  return {
    nodes: window.__kg.state.nodes.map((n) => ({ label: n.label, aliases: [...n.aliases], props: n.properties.map((p) => p.name) })),
    edges: window.__kg.state.edges.map((e) => ({ relation: e.relation, from: label(e.source), to: label(e.target), aliases: [...(e.aliases || [])] })),
  };
});

test("every interview request offers the rename tool, after the other three", async () => {
  await withPage(async (page) => {
    await connect(page);
    const requests = mockChatSequence(page, [textBody("ok")]);
    await send(page, "hello");
    assert.deepEqual(toolNames(requests[0]), ["apply_ontology_yaml", "get_graph_state", "remove_ontology_elements", "rename_ontology_elements"]);
  });
});

test("classes, relationships and properties are renamed in place in one batch; previous names become aliases; a relationship can be turned round", async () => {
  await withPage(async (page) => {
    await connect(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), SEED);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    const requests = mockChatSequence(page, [
      toolBody([
        toolCall("r1", "rename_ontology_elements", { renames: [
          { kind: "class", from: "Sink", to: "Drain" },
          { kind: "relationship", from: "connectsTo", to: "drainsInto", source: "Source", target: "Sink" },
          { kind: "property", from: "currentLevel", to: "level", className: "Source" },
          { kind: "class", from: "Nowhere", to: "Somewhere" },
        ] }),
        // Renames add no content: the turn's one real edit is still available.
        toolCall("a1", "apply_ontology_yaml", { yaml: "classes:\n  Valve:\n    meaning: A device that regulates flow.\n" }),
      ]),
      textBody("done"),
    ]);
    await send(page, "use my words");

    const g = await graph(page);
    const drain = g.nodes.find((n) => n.label === "Drain");
    assert.ok(drain, "the class is re-keyed, not re-created");
    assert.deepEqual(drain.aliases, ["Sink"]);
    assert.equal(g.nodes.length, 3, "Source, Drain, Valve: nothing duplicated");
    assert.deepEqual(g.nodes.find((n) => n.label === "Source").props, ["level"]);
    assert.deepEqual(g.edges, [{ relation: "drainsInto", from: "Source", to: "Drain", aliases: ["connectsTo"] }]);

    const result = requests[1].messages.find((m) => m.role === "tool" && m.tool_call_id === "r1").content;
    assert.match(result, /^Renamed 3 of 4:/);
    assert.match(result, /Error: no class named "Nowhere"/);
    const log = await page.evaluate(() => window.__kg.agent.state.renameLog.map((r) => [r.kind, r.from, r.to, r.ok]));
    assert.deepEqual(log, [["class", "Sink", "Drain", true], ["relationship", "connectsTo", "drainsInto", true],
      ["property", "currentLevel", "level", true], ["class", "Nowhere", "Somewhere", false]]);

    assert.equal(await page.evaluate(() => window.__kg.history.past.length) - historyBefore, 1, "renames and the apply fold into one undo step");
    await page.evaluate(() => window.__kg.actions.undo());
    const undone = await graph(page);
    assert.deepEqual(undone.nodes.map((n) => n.label).sort(), ["Sink", "Source"]);
    assert.equal(undone.edges[0].relation, "connectsTo");
  });
});

test("a relationship stated the other way round is re-recorded in the expert's direction with the expert's verb", async () => {
  await withPage(async (page) => {
    await connect(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), SEED);
    mockChatSequence(page, [
      toolBody([toolCall("r1", "rename_ontology_elements", { renames: [
        { kind: "relationship", from: "connectsTo", to: "receivesFrom", source: "Source", target: "Sink", reverse: true },
      ] })]),
      textBody("done"),
    ]);
    await send(page, "the other way round");
    assert.deepEqual((await graph(page)).edges, [{ relation: "receivesFrom", from: "Sink", to: "Source", aliases: ["connectsTo"] }]);
  });
});

test("a rename onto an existing name is refused and changes nothing", async () => {
  await withPage(async (page) => {
    await connect(page);
    await page.evaluate((y) => window.__kg.formats.commitYamlImport(y, "merge"), SEED);
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    const requests = mockChatSequence(page, [
      toolBody([toolCall("r1", "rename_ontology_elements", { renames: [{ kind: "class", from: "Sink", to: "Source" }] })]),
      textBody("done"),
    ]);
    await send(page, "rename");
    assert.match(requests[1].messages.find((m) => m.role === "tool").content, /Renamed 0 of 1:[\s\S]*already exists/);
    assert.deepEqual((await graph(page)).nodes.map((n) => n.label).sort(), ["Sink", "Source"]);
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore);
  });
});
