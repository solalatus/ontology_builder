import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Issue #178: a fresh connection lands on the pinned model (GPT-6.1-sol)
// whenever the key can reach it, OpenAI or Azure, however the platform or
// the Azure operator named it. Mocked throughout: no key, no network.

const pick = (page, models) => page.evaluate((m) => window.__kg.agent.pickDefaultModel(m), models);

test("the pinned model is GPT-6.1-sol, and equivalent spellings normalise to the same name", async () => {
  await withPage(async (page) => {
    const pinned = await page.evaluate(() => window.__kg.agent.pinnedModel);
    assert.equal(pinned, "gpt-6.1-sol");
    const same = [
      "gpt-6.1-sol", "GPT-6.1-Sol", "gpt-61-sol", "gpt-6-1-sol", "gpt6.1sol", "GPT 6.1 Sol", "gpt_6_1_sol",
      "gpt-6.1-sol-2026-09-30", "gpt-6.1-sol-20260930", "gpt-6.1-sol-preview", "gpt-6.1-sol-preview-2026-09-30",
      "azure/gpt-6.1-sol", "openai/gpt-61-sol",
    ];
    const different = ["gpt-6.1-sol-mini", "gpt-6.1-sol-nano", "gpt-6.1-sol-pro", "gpt-6.10-sol", "gpt-6.1", "gpt-6.1-luna", "gpt-6-sol", "gpt-16.1-sol"];
    const canon = (names) => page.evaluate((ns) => ns.map((n) => window.__kg.agent.canonicalModelName(n)), names);
    const target = (await canon([pinned]))[0];
    for (const [name, c] of (await canon(same)).map((c, i) => [same[i], c])) assert.equal(c, target, `${name} should match`);
    for (const [name, c] of (await canon(different)).map((c, i) => [different[i], c])) assert.notEqual(c, target, `${name} must not match`);
  });
});

test("OpenAI: the pinned model wins over newer models, including a newer standard tier", async () => {
  await withPage(async (page) => {
    const models = [
      { id: "gpt-6.2", created: 900, baseModel: "gpt-6.2" },
      { id: "gpt-6.1-sol-2026-09-30", created: 500, baseModel: "gpt-6.1-sol-2026-09-30" },
      { id: "gpt-5.5", created: 100, baseModel: "gpt-5.5" },
    ];
    assert.equal(await pick(page, models), "gpt-6.1-sol-2026-09-30");
  });
});

test("Azure: matched on the deployment's model, never on its free-form name", async () => {
  await withPage(async (page) => {
    // An operator's naming, with Azure's dot-dropping model name.
    assert.equal(await pick(page, [
      { id: "team-prod-chat", created: 10, baseModel: "gpt-61-sol" },
      { id: "newer-thing", created: 99, baseModel: "gpt-6.2" },
    ]), "team-prod-chat");
    // A deployment *named* like the pinned model but running something else
    // is not the pinned model: the old rule decides.
    assert.equal(await pick(page, [
      { id: "gpt-6.1-sol", created: 99, baseModel: "gpt-4o" },
      { id: "real-reasoner", created: 10, baseModel: "gpt-5.5" },
    ]), "real-reasoner");
  });
});

test("several deployments of the pinned model: the newest one", async () => {
  await withPage(async (page) => {
    assert.equal(await pick(page, [
      { id: "sol-old", created: 10, baseModel: "gpt-6.1-sol" },
      { id: "sol-new", created: 20, baseModel: "gpt-6.1-sol-2026-09-30" },
      { id: "other", created: 99, baseModel: "gpt-6.2" },
    ]), "sol-new");
  });
});

test("without the pinned model, the previous default rule applies unchanged", async () => {
  await withPage(async (page) => {
    // Near-misses are not the pinned model, and the codename exclusion still
    // holds for every other codename variant.
    assert.equal(await pick(page, [
      { id: "gpt-6.1-sol-mini", created: 99, baseModel: "gpt-6.1-sol-mini" },
      { id: "gpt-6.10-sol", created: 98, baseModel: "gpt-6.10-sol" },
      { id: "gpt-6.1-luna", created: 97, baseModel: "gpt-6.1-luna" },
      { id: "gpt-6.1", created: 50, baseModel: "gpt-6.1" },
      { id: "gpt-5.5", created: 40, baseModel: "gpt-5.5" },
    ]), "gpt-6.1");
  });
});

// --- End to end through the real connect modal ------------------------------

async function connectOpenAi(page, ids) {
  await page.route("https://api.openai.com/v1/models", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: ids.map((id, i) => ({ id, created: 100 + i, object: "model", owned_by: "openai" })) }),
  }));
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
}

test("end to end, OpenAI key: the connect modal preselects the pinned model and the connection uses it", async () => {
  await withPage(async (page) => {
    await connectOpenAi(page, ["gpt-5.5", "gpt-6.1-sol", "gpt-6.2"]);
    assert.equal(await page.inputValue("#agent-model-select-modal"), "gpt-6.1-sol");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.model), "gpt-6.1-sol");
  });
});

test("end to end, Azure key: the deployment running the pinned model is preselected, whatever it is called", async () => {
  await withPage(async (page) => {
    const endpoint = "https://my-resource.openai.azure.com";
    await page.route(`${endpoint}/openai/deployments**`, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [
        { id: "prod-reasoner", model: "gpt-6.2", created_at: 300, status: "succeeded" },
        { id: "interviews-eu", model: "gpt-61-sol", created_at: 200, status: "succeeded" },
        { id: "legacy", model: "gpt-4o", created_at: 100, status: "succeeded" },
      ] }),
    }));
    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "azure-secret");
    await page.click("#agent-azure-config-open");
    await page.fill("#agent-azure-endpoint-input", endpoint);
    await page.click("#agent-azure-config-save");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    assert.equal(await page.inputValue("#agent-model-select-modal"), "interviews-eu");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);
    assert.equal(await page.evaluate(() => window.__kg.agent.state.model), "interviews-eu");
  });
});
