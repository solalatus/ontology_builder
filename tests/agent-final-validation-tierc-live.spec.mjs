import { test } from "node:test";
import assert from "node:assert/strict";
// Resource errors tolerated: a model may answer the first tool call with a
// documented one-time 400 the app corrects (see isOneTimeCorrection in
// tests/lib/liveProvider.mjs), and the browser logs that 400.
import { withPageAllowingResourceErrors as withPage } from "./lib/liveOpenAi.mjs";
import { sendChatMessage, forwardChatToRealProvider, connectAgentLiveProvider, resolveLlmConfig, missingCredentials } from "./lib/liveProvider.mjs";

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
// The requests name Phase 10(b) because the tool schema reserves
// finalValidation:true for that checklist, and a reasoning model (GPT-6
// Sol, live 2026-10-19) honours the schema over an out-of-place request.
//
// Same opt-in gating as every other live suite in this repo: skipped with a
// clear reason unless the configured provider's credentials are set. Never runs in CI.

// Whichever provider the repo-root .env selects (tests/lib/llmProvider.mjs).
const LLM = resolveLlmConfig();
const skip = missingCredentials(LLM) || false;


// A small but finished-looking model (competency questions, meanings), so a
// request for the final checklist matches what the canvas shows.
const FINISHED_MODEL = [
  "competency_questions:",
  "  - text: At which station is a given widget processed?",
  "classes:",
  "  Widget:",
  "    meaning: A manufactured part moving through the line.",
  "    properties: {}",
  "  Station:",
  "    meaning: A work cell on the production line.",
  "    properties: {}",
  "relationships:",
  "  - name: processedAt",
  "    from: Widget",
  "    to: Station",
  "    meaning: The station where the widget is worked on.",
  "",
].join("\n");

// The model decides whether a request really is the final checklist, and a
// reasoning model sometimes answers with finalValidation:false (GPT-6 Sol,
// live 2026-10-19). This suite checks the wiring, not that judgement
// (agent-final-validation-tierc.spec.mjs covers the mechanism offline), so
// the request is repeated -- at most five times -- until one
// finalValidation:true call has been made, each retry in a new conversation.
async function finalValidationCalls(page) {
  return page.evaluate(() => window.__kg.agent.state.apiMessages
    .filter((m) => Array.isArray(m.tool_calls))
    .flatMap((m) => m.tool_calls)
    .filter((c) => c.function && c.function.name === "get_graph_state" && /"finalValidation"\s*:\s*true/.test(c.function.arguments || "")).length);
}

// Returns whether the model made the call; throws if it was `required`.
// With `fresh`, each retry starts a new conversation: a model that has
// declined once tends to keep to it within the same conversation.
async function askUntilFinalValidation(page, text, { tries = 5, required = true, fresh = false } = {}) {
  const before = await finalValidationCalls(page);
  for (let i = 0; i < tries; i++) {
    if (fresh && i > 0) await page.evaluate(() => window.__kg.agent.restartConversation());
    await sendChatMessage(page, text);
    if (await finalValidationCalls(page) > (fresh && i > 0 ? 0 : before)) return true;
  }
  if (required) throw new Error(`the model did not call get_graph_state with finalValidation:true in ${tries} requests`);
  return false;
}

async function seed(page, yaml) {
  await page.evaluate((y) => {
    window.__kg.formats.openImportDialog(y, "yaml");
    document.getElementById("import-replace").click();
  }, yaml);
}

test("live: get_graph_state finalValidation:true actually round-trips one real Tier C call and surfaces its result without hanging", { skip, timeout: 480000 }, async () => {
  await withPage(async (page) => {
    forwardChatToRealProvider(page, LLM);
    // page.on("request") rather than a second page.route() on the same
    // pattern: the relay's own route already fulfils every
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

    await seed(page, FINISHED_MODEL);
    await connectAgentLiveProvider(page, LLM);

    await askUntilFinalValidation(
      page,
      "We have finished the interview and are at Phase 10(b), the final checklist. Please call get_graph_state right now with finalValidation set to true, and briefly tell me what it found.",
      { fresh: true },
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

test("live: a second finalValidation:true call in the same conversation does not spend a second real Tier C request", { skip, timeout: 600000 }, async () => {
  await withPage(async (page) => {
    forwardChatToRealProvider(page, LLM);
    // page.on("request") rather than a second page.route() on the same
    // pattern: the relay's own route already fulfils every
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

    await seed(page, FINISHED_MODEL);
    await connectAgentLiveProvider(page, LLM);

    await askUntilFinalValidation(page, "We have finished the interview and are at Phase 10(b), the final checklist. Please call get_graph_state right now with finalValidation set to true, and briefly tell me what it found.", { fresh: true });
    // A second finalValidation:true call is the model's choice: the schema
    // says Tier C runs at most once per conversation, and a reasoning model
    // may decline to repeat it. Either way exactly one Tier C request may
    // go out; whether the bound itself was exercised live is printed.
    const secondCall = await askUntilFinalValidation(page,
      "Please run the Phase 10(b) final checklist once more: call get_graph_state again with finalValidation set to true.",
      { required: false });
    console.log(`[live #156] second finalValidation:true call made: ${secondCall}${secondCall ? "" : " (the bound was not exercised live; the mocked suite covers it)"}`);

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
