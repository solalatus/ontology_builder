import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";
import { loadEnvKey } from "./lib/env.mjs";
import { sendChatMessage, forwardToRealAzure, connectAgentLiveAzure } from "./lib/liveAzureOpenAi.mjs";

// LIVE, opt-in smoke test for issue #156's new wiring: get_graph_state's
// optional finalValidation:true argument, which triggers one bounded,
// automatic Tier C (LLM second-opinion) call mid-conversation.
//
// tests/agent-final-validation-tierc.spec.mjs already covers the mechanism
// exhaustively offline (bounded-once, findings surfaced, failure handling,
// the shared prompt) with a scripted model. What that suite cannot answer
// is whether the new code survives a real round trip: a real nested chat
// completion fired from inside the tool-call loop, a real (not
// hand-authored) response body parsed by fetchConsistencyLlmFindings(),
// and the bound holding across two real conversation turns. The underlying
// call path (fetchConsistencyLlmFindings/CONSISTENCY_LLM_PROMPT) is the
// same one the pre-existing, already-live-validated Tier C feature (issue
// #89, see tests/evals/results/baselines/tier-c/TIER_C_REPORT.md) uses --
// so this is deliberately narrow: it checks the new glue
// (handleGetGraphStateCall's async finalValidation branch and the
// once-per-conversation bound), not Tier C's finding quality, which is
// out of scope here and already measured elsewhere.
//
// Same opt-in gating as every other live suite in this repo: skipped with a
// clear reason unless both AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT
// are set. Never runs in CI.

const AZURE_OPENAI_API_KEY = loadEnvKey("AZURE_OPENAI_API_KEY");
const AZURE_OPENAI_ENDPOINT = loadEnvKey("AZURE_OPENAI_ENDPOINT");
const skip = (AZURE_OPENAI_API_KEY && AZURE_OPENAI_ENDPOINT)
  ? false
  : "Set both AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in a .env file at the repo root (see tests/README.md) to run this live smoke test.";

function chatUrlPattern(endpoint) {
  return `${endpoint.replace(/\/+$/, "")}/openai/deployments/**/chat/completions**`;
}

async function seed(page, yaml) {
  await page.evaluate((y) => {
    window.__kg.formats.openImportDialog(y, "yaml");
    document.getElementById("import-replace").click();
  }, yaml);
}

test("live: get_graph_state finalValidation:true actually round-trips one real Tier C call and surfaces its result without hanging", { skip, timeout: 90000 }, async () => {
  await withPage(async (page) => {
    const chatUrl = chatUrlPattern(AZURE_OPENAI_ENDPOINT);
    forwardToRealAzure(page, chatUrl);
    // page.on("request") rather than a second page.route() on the same
    // pattern: forwardToRealAzure's own route already fulfils every
    // matching request, so a second route handler here would just race it
    // for which one finishes the request first. The request event fires
    // for every request regardless of how (or whether) it gets routed, so
    // it observes the real outgoing body without competing to handle it.
    const requestBodies = [];
    page.on("request", (req) => {
      if (req.url().includes("/chat/completions") && req.postData()) {
        try { requestBodies.push(JSON.parse(req.postData())); } catch { /* not this call */ }
      }
    });

    await seed(page, "classes:\n  Widget:\n    properties: {}\n  Station:\n    properties: {}\nrelationships:\n  - name: processedAt\n    from: Widget\n    to: Station\n");
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);

    await sendChatMessage(
      page,
      "Please call get_graph_state right now with finalValidation set to true, and briefly tell me what it found."
    );

    const tierCRequestBodies = requestBodies.filter((b) =>
      b.messages[0] && b.messages[0].role === "system" && /internal contradictions/.test(b.messages[0].content || "")
    );
    assert.equal(tierCRequestBodies.length, 1, "exactly one real Tier C request should have gone out for one finalValidation:true call");

    const toolResults = await page.evaluate(() => window.__kg.agent.state.apiMessages
      .filter((m) => m.role === "tool")
      .map((m) => m.content));
    assert.ok(
      toolResults.some((t) => /SECOND-OPINION MODEL CHECK/.test(t)),
      `expected the get_graph_state tool result to carry the second-opinion appendix; got: ${JSON.stringify(toolResults)}`
    );

    assert.equal(await page.evaluate(() => window.__kg.agent.isSending()), false, "the turn must finish, not hang, after the real nested Tier C call");
  });
});

test("live: a second finalValidation:true call in the same conversation does not spend a second real Tier C request", { skip, timeout: 120000 }, async () => {
  await withPage(async (page) => {
    const chatUrl = chatUrlPattern(AZURE_OPENAI_ENDPOINT);
    forwardToRealAzure(page, chatUrl);
    // page.on("request") rather than a second page.route() on the same
    // pattern: forwardToRealAzure's own route already fulfils every
    // matching request, so a second route handler here would just race it
    // for which one finishes the request first. The request event fires
    // for every request regardless of how (or whether) it gets routed, so
    // it observes the real outgoing body without competing to handle it.
    const requestBodies = [];
    page.on("request", (req) => {
      if (req.url().includes("/chat/completions") && req.postData()) {
        try { requestBodies.push(JSON.parse(req.postData())); } catch { /* not this call */ }
      }
    });

    await seed(page, "classes:\n  Widget:\n    properties: {}\n  Station:\n    properties: {}\nrelationships:\n  - name: processedAt\n    from: Widget\n    to: Station\n");
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);

    await sendChatMessage(page, "Please call get_graph_state right now with finalValidation set to true.");
    await sendChatMessage(page, "Please call get_graph_state again with finalValidation set to true, one more time.");

    const tierCRequestBodies = requestBodies.filter((b) =>
      b.messages[0] && b.messages[0].role === "system" && /internal contradictions/.test(b.messages[0].content || "")
    );
    assert.equal(tierCRequestBodies.length, 1, "the second finalValidation:true call must not spend a second real Tier C request");

    const toolResults = await page.evaluate(() => window.__kg.agent.state.apiMessages
      .filter((m) => m.role === "tool")
      .map((m) => m.content));
    assert.ok(
      toolResults.some((t) => /already attempted once this conversation, not repeated/.test(t)),
      `expected the second call's tool result to say the bound held; got: ${JSON.stringify(toolResults)}`
    );
  });
});
