import { test } from "node:test";
import assert from "node:assert/strict";
// Resource errors tolerated: a codename model answers its first tool call
// with a documented one-time 400 the app corrects (isOneTimeCorrection).
import { withPageAllowingResourceErrors as withPage } from "./lib/liveOpenAi.mjs";
import {
  sendChatMessage, forwardChatToRealProvider, connectAgentLiveProvider, resolveLlmConfig, missingCredentials,
  unexpectedFailures, replyMessage,
} from "./lib/liveProvider.mjs";

// LIVE acceptance check for issue #181, required before any #182 run: on the
// model the app's default lands on (#178 ladder), with the provider the
// repo-root .env selects, a tool-attached interview call and a call without
// tools both succeed at an explicit `medium` and at an explicit `high`, with
// the effort actually on the wire in the route's own shape. Prints the
// reasoning tokens each level produced. Skips without credentials; never
// runs in CI.

const LLM = resolveLlmConfig();
const skip = missingCredentials(LLM) || false;

for (const effort of ["medium", "high"]) {
  test(`live (#181): explicit reasoning effort "${effort}" is accepted on the default model, with and without tools`, { skip, timeout: 300000 }, async () => {
    await withPage(async (page) => {
      const responses = forwardChatToRealProvider(page, LLM);
      const requests = [];
      page.on("request", (req) => {
        if (req.method() === "POST" && /\/(chat\/completions|responses)(\?|$)/.test(req.url())) requests.push({ url: req.url(), body: req.postDataJSON() });
      });
      await connectAgentLiveProvider(page, LLM, { reasoningEffort: effort });
      const model = await page.evaluate(() => window.__kg.agent.state.model);
      assert.equal(await page.evaluate(() => window.__kg.agent.effectiveReasoningEffort()), effort,
        `${model} should be a reasoning model, and the chosen effort the one in force`);

      // Mid-interview, as in real use (see helper-agent-live-azure.spec.mjs).
      await page.evaluate(() => window.__kg.formats.commitYamlImport(
        "competency_questions:\n  - text: Which supplier issued a given invoice?\n", "merge"));
      await sendChatMessage(page, "Add a class called Invoice, meaning: a request from a supplier to receive payment. "
        + "The competency question on the canvas is agreed. Use the apply_ontology_yaml tool right now to add it — don't just describe it in text.", { timeout: 240000 });
      await page.evaluate(() => window.__kg.consistency.llm.run());

      const state = await page.evaluate(() => ({
        notes: window.__kg.agent.state.transcript.filter((m) => m.role === "system").map((m) => m.text),
        usage: window.__kg.agent.state.usage,
        viaResponses: window.__kg.agent.state.toolsViaResponses,
      }));
      console.log(`[live #181] provider=${LLM.provider} model=${model} effort=${effort} toolsViaResponses=${state.viaResponses} `
        + `calls=${state.usage.map((e) => `${e.kind}/${e.api || "chat"}:reasoning=${(e.usage && e.usage.completion_tokens_details || {}).reasoning_tokens ?? "n/a"}`).join(" ")}`);

      assert.deepEqual(state.notes, [], `the app reported an error: ${state.notes.join(" | ")}`);
      assert.deepEqual(unexpectedFailures(responses), []);

      // The effort is on the wire on every call, in the route's own shape.
      const toolCalls = requests.filter((r) => Array.isArray(r.body.tools));
      const plainCalls = requests.filter((r) => !Array.isArray(r.body.tools));
      assert.ok(toolCalls.length >= 1 && plainCalls.length >= 1, "at least one call with tools and one without");
      for (const r of requests) {
        const sent = /\/responses(\?|$)/.test(r.url) ? r.body.reasoning && r.body.reasoning.effort : r.body.reasoning_effort;
        assert.equal(sent, effort, `${r.url} went out without the effort`);
      }

      // The acceptance question is whether tool calling works at this
      // effort, so any real tool call answers it. Whether the model then
      // applies the change is its judgement: at an explicit effort it
      // sometimes first asks the expert to confirm the seeded question
      // (live, 2026-10-19) -- recorded here, measured by #182, not asserted.
      const toolNames = responses.flatMap((r) => ((replyMessage(r) || {}).tool_calls || []).map((c) => c.function && c.function.name));
      console.log(`[live #181] effort=${effort} tool calls: ${toolNames.join(", ") || "none"}`);
      assert.ok(toolNames.length >= 1, `a real tool call at effort ${effort}`);
      assert.ok(state.usage.every((e) => e.reasoning_effort === effort), "every usage entry records the effort");
      assert.ok(state.usage.some((e) => e.kind === "consistency_llm"), "the call without tools succeeded");
    });
  });
}
