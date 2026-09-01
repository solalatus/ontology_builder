import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";
import { loadEnvKey } from "./lib/env.mjs";
import { sendChatMessage, forwardToRealAzure, connectAgentLiveAzure } from "./lib/liveAzureOpenAi.mjs";

// LIVE, opt-in behavioral check for issue #140's fix: does a real model
// actually reach for the new remove_ontology_elements tool when a genuine
// deletion is called for, rather than repeating the exact failure mode the
// manual audit found (rewriting `meaning` to a self-directed "REMOVE" note
// instead of deleting anything)? tests/agent-remove-tool.spec.mjs already
// covers the mechanics offline with a scripted/mocked model (tool dispatch,
// undo, budget sharing, cascade deletion, malformed args) -- what only a
// real model can answer is the actual question issue #140 turned on: given
// the tool now exists and the prompt now describes it, does the model
// choose to use it correctly? A mocked test can't fail this way; only a
// live one can.
//
// Deliberately NOT a full non-regression evaluation (no 3-replicate live
// benchmark run against the anchor distribution) -- there was no budget for
// that in this pass (see ontology_translation/TODO.md's dated entry and
// tests/agent-production-invariants.spec.mjs's own comment on
// PRODUCTION_SYSTEM_PROMPT_SHA256 for that explicit tradeoff). This is a
// small, targeted substitute: two short, scripted scenarios, a handful of
// real API calls total, checking the one specific behavior this change
// exists to fix -- not a measurement of interview quality or recovery
// scores in general.
//
// Same opt-in gating as every other live suite in this repo: skipped with a
// clear reason unless both AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT
// are set. Never runs in CI.

const AZURE_OPENAI_API_KEY = loadEnvKey("AZURE_OPENAI_API_KEY");
const AZURE_OPENAI_ENDPOINT = loadEnvKey("AZURE_OPENAI_ENDPOINT");
const skip = (AZURE_OPENAI_API_KEY && AZURE_OPENAI_ENDPOINT)
  ? false
  : "Set both AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in a .env file at the repo root (see tests/README.md) to run this live behavioral check.";

function chatUrlPattern(endpoint) {
  return `${endpoint.replace(/\/+$/, "")}/openai/deployments/**/chat/completions**`;
}

async function seed(page, yaml) {
  await page.evaluate((y) => {
    window.__kg.formats.openImportDialog(y, "yaml");
    document.getElementById("import-replace").click();
  }, yaml);
}

// Every tool_calls entry the live conversation actually sent, across every
// round of this turn -- apiMessages is the exact wire history, not the
// human-facing transcript, so this is what the model itself chose to call.
async function toolCallsMade(page) {
  return page.evaluate(() => window.__kg.agent.state.apiMessages
    .filter((m) => Array.isArray(m.tool_calls))
    .flatMap((m) => m.tool_calls.map((c) => ({ name: c.function.name, args: c.function.arguments }))));
}

async function anyMeaningContainsSentinel(page) {
  return page.evaluate(() => {
    const model = window.__kg.formats.buildDomainModel();
    const texts = [
      ...Object.values(model.classes).map((c) => c.meaning),
      ...model.relationships.map((r) => r.meaning),
    ];
    return texts.some((t) => typeof t === "string" && /\bremove\b/i.test(t.trim()));
  });
}

test("live: told a mistakenly-added relationship whose meaning literally says REMOVE should actually be deleted, the model calls remove_ontology_elements, not another meaning-sentinel edit", { skip, timeout: 90000 }, async () => {
  await withPage(async (page) => {
    forwardToRealAzure(page, chatUrlPattern(AZURE_OPENAI_ENDPOINT));
    await seed(page,
      "classes:\n  Zone:\n    properties: {}\n  Thermostat:\n    properties: {}\nrelationships:\n  - name: isServedBy\n    from: Zone\n    to: Thermostat\n    meaning: REMOVE\n");
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);

    await sendChatMessage(page,
      "Before we continue, I want to clean something up: there's a relationship called "
      + "\"isServedBy\" from Zone to Thermostat whose description just says \"REMOVE\" -- "
      + "that was a mistake from earlier and it should not be in the model at all. Please "
      + "actually delete it, don't just leave a note on it.");

    const calls = await toolCallsMade(page);
    const removeCall = calls.find((c) => c.name === "remove_ontology_elements");
    assert.ok(removeCall, `expected a remove_ontology_elements call; got tool calls: ${JSON.stringify(calls)}`);
    const args = JSON.parse(removeCall.args);
    assert.ok(
      Array.isArray(args.relationships) && args.relationships.some((r) => r.from === "Zone" && r.to === "Thermostat"),
      `expected the removal to name the Zone->Thermostat relationship; got ${JSON.stringify(args)}`
    );

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 0, "the relationship should actually be gone from the live model");
    assert.equal(await anyMeaningContainsSentinel(page), false, "no remaining class/relationship should carry a REMOVE-style sentinel meaning");
  });
});

test("live: shown a model with a reverse-direction duplicate relationship and asked what looks wrong, the model uses remove_ontology_elements to actually fix it, not just describe it", { skip, timeout: 120000 }, async () => {
  await withPage(async (page) => {
    forwardToRealAzure(page, chatUrlPattern(AZURE_OPENAI_ENDPOINT));
    await seed(page,
      "classes:\n  Incident:\n    properties: {}\n  Engineer:\n    properties: {}\nrelationships:\n  - name: relatesTo\n    from: Incident\n    to: Engineer\n  - name: relatesTo\n    from: Engineer\n    to: Incident\n");
    await connectAgentLiveAzure(page, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT);

    await sendChatMessage(page,
      "Can you check the current model with get_graph_state and tell me if anything "
      + "looks wrong? If you find something that's clearly a mistake, please go ahead "
      + "and fix it rather than just describing it.");

    let calls = await toolCallsMade(page);
    // A real model may describe the problem first and only fix it once asked
    // directly -- one bounded follow-up nudge, not an open-ended retry loop,
    // mirrors how a real expert would actually respond mid-interview.
    if (!calls.some((c) => c.name === "remove_ontology_elements")) {
      await sendChatMessage(page, "Yes, please go ahead and remove the duplicate direction now.");
      calls = await toolCallsMade(page);
    }

    const removeCall = calls.find((c) => c.name === "remove_ontology_elements");
    assert.ok(removeCall, `expected a remove_ontology_elements call at some point; got tool calls: ${JSON.stringify(calls)}`);

    const edges = await page.evaluate(() => window.__kg.state.edges);
    assert.equal(edges.length, 1, "exactly one direction of the duplicate relationship should remain");
    const findings = await page.evaluate(() => window.__kg.consistency.current());
    assert.deepEqual(findings.filter((f) => f.check === "inverse-pair"), [], "the inverse-pair warning must actually be cleared, not just discussed");
  });
});
