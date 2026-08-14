import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Competency-question coverage (issue #94 §14-§17) — the one model-based
// part of the feature. Every model call here is mocked via page.route(): no
// real network, no API key, deterministic in CI.
//
// The property under test throughout is the separation the issue insists on:
// this pass is a model's opinion about whether the ontology orients a future
// agent well enough, it sits *next to* the deterministic consistency checker
// rather than inside it, and it can never edit anything or outrank a
// deterministic finding.

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

function mockModelsRoute(page) {
  return page.route(MODELS_URL, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
  }));
}

// Returns the array of request bodies the app actually sent, so a test can
// assert on how many calls one click made and what was in them.
function mockChat(page, replyText) {
  const requests = [];
  page.route(CHAT_URL, (route) => {
    requests.push(route.request().postDataJSON());
    route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ choices: [{ index: 0, message: { role: "assistant", content: replyText }, finish_reason: "stop" }] }),
    });
  });
  return requests;
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

// A small model with two questions, one well covered and one not, so a
// coverage verdict has something real to be about.
async function seedModel(page) {
  await page.evaluate(() => {
    window.__kg.formats.commitYamlImport([
      "competency_questions:",
      "  - text: Which escalation policy applies to this support request?",
      "  - text: Which support team should receive the request?",
      "classes:",
      "  SupportRequest:",
      "    properties:",
      "      severity:",
      "        type: text",
      "  EscalationPolicy:",
      "    properties: {}",
      "relationships:",
      "  - name: escalatesUnder",
      "    from: SupportRequest",
      "    to: EscalationPolicy",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n"), "merge");
  });
}

const TWO_VERDICTS = '```json\n' + JSON.stringify([
  { cq_id: "cq1", status: "covered", evidence: ["SupportRequest", "severity", "EscalationPolicy", "escalatesUnder"], gap: "" },
  { cq_id: "cq2", status: "partial", evidence: ["SupportRequest"], gap: "The model does not say which attributes determine routing." },
]) + '\n```';

async function runCoverage(page) {
  await page.evaluate(() => window.__kg.consistency.open());
  await page.evaluate(() => window.__kg.consistency.cqCoverage.run());
  await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());
}

test("the coverage control is hidden while the model has no competency questions", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.consistency.open());
    assert.equal(await page.locator("#cq-coverage-section").isVisible(), false,
      "nothing to check means no control to click");

    await page.evaluate(() => {
      window.__kg.actions.createCompetencyQuestion("Which escalation policy applies?");
      window.__kg.consistency.close();
      window.__kg.consistency.open();
    });
    assert.equal(await page.locator("#cq-coverage-section").isVisible(), true);
    assert.equal(await page.locator("#cq-coverage-run").isDisabled(), true,
      "visible but unusable without a connected agent, same posture as the model contradiction pass");
  });
});

test("opening the panel sends nothing — one click is exactly one model call", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    const requests = mockChat(page, TWO_VERDICTS);

    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.close());
    await page.evaluate(() => window.__kg.consistency.open());
    assert.deepEqual(requests, [], "merely opening the panel must not call anything");

    await page.evaluate(() => window.__kg.consistency.cqCoverage.run());
    await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());
    assert.equal(requests.length, 1);
    // The coverage pass gets the questions; that is its whole task.
    assert.match(requests[0].messages[1].content, /competency_questions:/);
    assert.match(requests[0].messages[0].content, /checking whether an Agent Ontology covers its competency questions/);
  });
});

test("covered, partial and missing verdicts render separately, with evidence and gaps", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    mockChat(page, TWO_VERDICTS);
    await runCoverage(page);

    const results = await page.evaluate(() => window.__kg.consistency.cqCoverage.results());
    assert.deepEqual(results.map((r) => r.status).sort(), ["covered", "partial"]);
    assert.match(await page.locator("#cq-coverage-summary").textContent(), /1 covered, 1 partial, 0 not covered/);

    const rendered = await page.locator("#cq-coverage-list .cq-coverage-item-head").allTextContents();
    assert.deepEqual(rendered.map((h) => h.split(" ").slice(1).join(" ")), ["PARTIAL", "COVERED"],
      "the unfinished ones render first — that is what a reader has to act on");

    const listText = await page.locator("#cq-coverage-list").textContent();
    assert.match(listText, /\[cq1\] COVERED/);
    assert.match(listText, /\[cq2\] PARTIAL/);
    assert.match(listText, /Evidence: SupportRequest; severity; EscalationPolicy; escalatesUnder/);
    assert.match(listText, /Gap: The model does not say which attributes determine routing\./);
    assert.match(await page.locator("#cq-coverage-status").textContent(), /not a deterministic result/i,
      "the result must be labelled as the model judgement it is");
  });
});

test("a verdict about an unknown competency question, or with an invalid status, is discarded", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    mockChat(page, '```json\n' + JSON.stringify([
      { cq_id: "cq1", status: "covered", evidence: [], gap: "" },
      { cq_id: "cq999", status: "covered", evidence: [], gap: "" },   // no such question
      { cq_id: "cq2", status: "excellent", evidence: [], gap: "" },   // not one of the three
    ]) + '\n```');
    await runCoverage(page);

    const results = await page.evaluate(() => window.__kg.consistency.cqCoverage.results());
    assert.deepEqual(results.map((r) => r.cqId), ["cq1"],
      "the model proposes the judgement; the app validates its shape and drops what it cannot resolve");
  });
});

test("malformed output fails visibly and leaves the deterministic findings alone", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    // A real deterministic finding to protect: EscalationPolicy has no
    // properties and the model is deliberately thin.
    const before = await page.evaluate(() => window.__kg.consistency.current());
    mockChat(page, "I'm afraid I can't answer that in JSON.");
    await runCoverage(page);

    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.cqCoverage.results()), []);
    assert.match(await page.locator("#cq-coverage-status").textContent(), /could not be completed/i);
    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.current()), before,
      "a failed coverage check must not disturb the deterministic findings");
  });
});

test("editing the ontology or the question list clears a previous coverage result", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    mockChat(page, TWO_VERDICTS);
    await runCoverage(page);
    assert.equal((await page.evaluate(() => window.__kg.consistency.cqCoverage.results())).length, 2);

    // Any real edit at all: this result described a model that no longer
    // exists. Driven through a real import commit rather than a bare
    // constructor, so it goes through the same pushHistory/badge-refresh path
    // a user's or the agent's own edit does.
    await page.evaluate(() => window.__kg.formats.commitYamlImport(
      "classes:\n  SupportTeam:\n    properties: {}\n", "agent-merge"));
    await page.evaluate(() => window.__kg.consistency.close());
    await page.evaluate(() => window.__kg.consistency.open());
    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.cqCoverage.results()), [],
      "stale coverage is never carried across an edit");
    assert.equal(await page.evaluate(() => window.__kg.consistency.cqCoverage.statusKey()), null);
  });
});

test("running coverage never edits the ontology and never touches the deterministic badge", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    const badgeBefore = await page.locator("#btn-consistency").textContent();
    const modelBefore = await page.evaluate(() => window.__kg.formats.buildDomainYamlExport());
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);

    mockChat(page, TWO_VERDICTS);
    await runCoverage(page);

    assert.equal(await page.evaluate(() => window.__kg.formats.buildDomainYamlExport()), modelBefore,
      "a coverage result is read-only — no automatic ontology edit ever follows from it");
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore);
    assert.equal(await page.locator("#btn-consistency").textContent(), badgeBefore,
      "the Check badge stays deterministic — a model opinion never colours it");
  });
});

test("the existing contradiction pass is still handed an ontology-only model, with no competency questions in it", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    const requests = mockChat(page, "```json\n[]\n```");

    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await page.waitForFunction(() => document.getElementById("consistency-llm-status").textContent.length > 0);

    assert.equal(requests.length, 1);
    const sentModel = requests[0].messages[1].content;
    assert.doesNotMatch(sentModel, /competency_questions/,
      "issue #94 §21: the already-evaluated contradiction pass must not silently acquire a new section to reason about");
    assert.match(sentModel, /^classes:/, "it still gets exactly the projection it always did");
    assert.doesNotMatch(requests[0].messages[0].content, /competency question/i,
      "and its task is unchanged — contradictions, not coverage");
  });
});

test("the two passes keep separate results: a coverage failure does not clear model contradiction findings", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);

    // First, a contradiction finding from the existing pass.
    await page.unroute(CHAT_URL).catch(() => {});
    mockChat(page, '```json\n[{"severity":"warning","subject":"escalatesUnder","message":"Two statements disagree."}]\n```');
    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await page.waitForFunction(() => window.__kg.consistency.llm.results().length > 0);

    // Then a coverage run that fails outright.
    await page.unroute(CHAT_URL);
    mockChat(page, "not json at all");
    await page.evaluate(() => window.__kg.consistency.cqCoverage.run());
    await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());

    assert.equal((await page.evaluate(() => window.__kg.consistency.llm.results())).length, 1,
      "the two model passes are independent — neither can invalidate the other's findings");
    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.cqCoverage.results()), []);
  });
});

test("result text is length-bounded, and duplicate verdicts for one question are ignored", async () => {
  await withPage(async (page) => {
    await connectAgent(page);
    await seedModel(page);
    const long = "x".repeat(900);
    mockChat(page, '```json\n' + JSON.stringify([
      { cq_id: "cq1", status: "partial", evidence: Array.from({ length: 40 }, (_, i) => `E${i}`), gap: long },
      { cq_id: "cq1", status: "missing", evidence: [], gap: "a second opinion on the same question" },
    ]) + '\n```');
    await runCoverage(page);

    const results = await page.evaluate(() => window.__kg.consistency.cqCoverage.results());
    assert.equal(results.length, 1, "first verdict per question wins; the rest are dropped");
    assert.equal(results[0].status, "partial");
    assert.equal(results[0].gap.length, 400);
    assert.equal(results[0].evidence.length, 12);
  });
});
