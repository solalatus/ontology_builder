import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";
import { loadEnvKey } from "./lib/env.mjs";
import {
  MODELS_URL, CHAT_URL, forwardToRealOpenAi, openPanel,
  connectAgentLive, sendChatMessage, withPageAllowingResourceErrors,
} from "./lib/liveOpenAi.mjs";

// Helper Agent — live OpenAI integration tests. Every other helper-agent-*
// spec file mocks the OpenAI API entirely (page.route() serving
// hand-authored JSON) so the suite is deterministic and needs no secret.
// This file is the deliberate exception: it makes genuine calls to the real
// OpenAI API, using a real key, to catch the class of bug a hand-authored
// mock can never catch -- a mismatch between what the code *assumes* the
// live API returns and what it *actually* returns today. Three real bugs
// were found this way (see the Log entries in helper_agent_todo.md): a
// default-model heuristic that picked a "deep-research" specialty model
// against a real account's model list, a 429 error message that conflated
// a transient rate limit with a permanently exhausted quota, and (found by
// this file's own broader sibling, the ontology-recovery eval's first full
// live conversation) a merge-mode bug where a second, minimal-diff tool
// call silently wiped a class's meaning and earlier-added properties.
//
// Opt-in, not required: skipped entirely, with a clear reason, unless
// OPENAI_API_KEY is set (in a gitignored .env at the repo root, or the
// environment) -- see tests/README.md. Costs a small amount of real money
// per run (a handful of gpt-4o-mini calls); never runs in CI, only when a
// key is deliberately provided.
//
// Why every "live" test still goes through page.route(): a real headless
// Chromium *inside this specific sandbox* cannot reach api.openai.com
// directly (confirmed via page.on("requestfailed") -> net::ERR_CONNECTION_RESET,
// reproducing even with the proxy explicitly configured and TLS errors
// ignored -- see helper_agent_plan.md §3's own CORS-spike writeup for the
// prior occurrence of this exact finding). A real user's own browser has no
// such restriction. To still exercise the app's real, unmodified code
// end-to-end -- the real system prompt it builds, the real tool schemas it
// sends, the real request/response handling -- each live test's
// page.route() handler *forwards* the app's real outgoing request body to
// the genuine OpenAI endpoint via Node's own fetch() (confirmed reachable
// from this sandbox at the Node level, unlike from inside Chromium) and
// relays the real response back unmodified. The browser drives real UI
// interactions and real app code the whole way; only the last network hop
// is relayed through Node rather than dialed directly, which is a sandbox
// artifact, not a change to what's being tested.
//
// Some assertions here are necessarily loose (matching a real, non-deterministic
// model's actual output) rather than exact-string, unlike the mocked suites'
// canned responses -- documented inline at each one.

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY
  ? false
  : "Set OPENAI_API_KEY in a .env file at the repo root (see tests/README.md) to run live OpenAI integration tests.";

test("live: GET /v1/models returns a real, non-empty, correctly-shaped model list for a valid key", { skip }, async () => {
  await withPage(async (page) => {
    const responses = forwardToRealOpenAi(page, MODELS_URL);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", OPENAI_API_KEY);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 30000 });

    assert.equal(responses.length, 1);
    assert.equal(responses[0].status, 200);
    const data = responses[0].body.data;
    assert.ok(Array.isArray(data) && data.length > 0, "a real key should see a non-empty model catalog");
    for (const m of data.slice(0, 5)) {
      assert.equal(typeof m.id, "string");
      assert.equal(typeof m.created, "number");
    }

    // The real default-model heuristic, run against this real live list --
    // must be a real id from that same list, and must not be one of the
    // specialty variants excluded by the deep-research/search fix.
    const preselected = await page.$eval("#agent-model-select-modal", (el) => el.value);
    assert.ok(data.some((m) => m.id === preselected), "the preselected default must be a real id from the live list");
    assert.doesNotMatch(preselected, /deep-research|search-preview|search-api/);
  });
});

test("live: an actually-invalid key gets a real 401 from OpenAI, correctly classified by the connect modal", { skip }, async () => {
  await withPageAllowingResourceErrors(async (page) => {
    const responses = forwardToRealOpenAi(page, MODELS_URL);
    await openPanel(page);
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-live-test-deliberately-invalid-000000000000000000");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.getConnectErrorKind() === "invalidKey", null, { timeout: 30000 });

    assert.equal(responses.length, 1);
    assert.equal(responses[0].status, 401);
    assert.equal(responses[0].body.error.code, "invalid_api_key");
  });
});

test("live: a real chat completion round-trips through the actual UI and renders the model's real reply", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLive(page, OPENAI_API_KEY);
    const chatResponses = forwardToRealOpenAi(page, CHAT_URL);

    await sendChatMessage(page, "Reply with a single short sentence confirming you're ready to help model a domain.");

    // Not necessarily exactly one real call: the real system prompt's own
    // "STAYING IN SYNC WITH THE LIVE ONTOLOGY" section legitimately
    // instructs the model to call get_graph_state at conversation start
    // (helper_agent_plan.md §4.5b), so a real model may issue a preliminary
    // tool-call round before its final text reply -- that's correct
    // behavior, not a bug, and asserting an exact call count would be
    // asserting a specific model's judgment call rather than the app's
    // actual contract. What must hold regardless: at least one real call
    // happened, and the *last* one is a genuine plain-text reply.
    assert.ok(chatResponses.length >= 1);
    for (const r of chatResponses) assert.equal(r.status, 200);
    const lastResponseMessage = chatResponses[chatResponses.length - 1].body.choices[0].message;
    assert.ok(!lastResponseMessage.tool_calls, "the final response in the exchange should be a plain reply, not another tool call");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const last = transcript[transcript.length - 1];
    assert.equal(last.role, "assistant");
    // Real, non-deterministic model output -- can't assert exact text, only
    // that a genuine, non-trivial reply came back.
    assert.ok(typeof last.text === "string" && last.text.trim().length > 0);
  });
});

test("live: a real tool-calling response actually applies to the canvas through the real import pipeline", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLive(page, OPENAI_API_KEY);
    const chatResponses = forwardToRealOpenAi(page, CHAT_URL);

    const before = await page.evaluate(() => window.__kg.state.nodes.length);
    await sendChatMessage(
      page,
      "Add a class called Invoice, meaning: a request from a supplier to receive payment. " +
      "Use the apply_ontology_yaml tool right now to add it — don't just describe it in text."
    );

    // At least one real response in this exchange should be a tool_calls
    // response naming apply_ontology_yaml -- the model actually deciding to
    // use the real tool schema the app sent it, not a scripted answer.
    const sawRealToolCall = chatResponses.some((r) => {
      const msg = r.body && r.body.choices && r.body.choices[0] && r.body.choices[0].message;
      return msg && Array.isArray(msg.tool_calls) && msg.tool_calls.some((c) => c.function && c.function.name === "apply_ontology_yaml");
    });
    assert.ok(sawRealToolCall, "expected the real model to call apply_ontology_yaml for a directive, unambiguous request");

    const after = await page.evaluate(() => window.__kg.state.nodes);
    assert.equal(after.length, before + 1, "the real tool call's YAML should have been parsed and committed through the real import pipeline");
    assert.ok(after.some((n) => /invoice/i.test(n.label)), "the newly-created node should be the Invoice class the model was asked for");

    // Transparency requirement (plan §4.5): a real applied-edit tool note
    // must be visible in the transcript, not just reflected in state.
    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.ok(transcript.some((m) => m.role === "tool" && /applied/i.test(m.text)));
  });
});

test("live: get_graph_state, called for real, sees a node added manually on the canvas outside the conversation", { skip }, async () => {
  await withPage(async (page) => {
    // A manual canvas edit made entirely outside the chat -- exactly the
    // "went stale after any manual edit" gap get_graph_state exists to
    // close (helper_agent_plan.md §4.5b). Added before connecting, so
    // there's no chance the model could have learned about it from the
    // conversation itself.
    await addNodeViaDblClick(page, 300, 200, "PreExistingLiveTestClass");
    await connectAgentLive(page, OPENAI_API_KEY);
    const chatResponses = forwardToRealOpenAi(page, CHAT_URL);

    await sendChatMessage(
      page,
      "Call get_graph_state right now to check the current model before we do anything else, then just tell me in one short sentence that you checked."
    );

    const sawRealGetGraphStateCall = chatResponses.some((r) => {
      const msg = r.body && r.body.choices && r.body.choices[0] && r.body.choices[0].message;
      return msg && Array.isArray(msg.tool_calls) && msg.tool_calls.some((c) => c.function && c.function.name === "get_graph_state");
    });
    assert.ok(sawRealGetGraphStateCall, "expected the real model to call get_graph_state for an explicit, unambiguous request to do so");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    assert.ok(transcript.some((m) => m.role === "tool" && /checked/i.test(m.text)));

    // The manually-added node must still be there -- get_graph_state is
    // read-only and must never itself mutate the canvas.
    const labels = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.label));
    assert.ok(labels.includes("PreExistingLiveTestClass"));
  });
});

test("live: the output-language lock holds for a real model against a real Hungarian directive", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLive(page, OPENAI_API_KEY);
    forwardToRealOpenAi(page, CHAT_URL);

    await sendChatMessage(page, "In two short sentences, tell me what you can help me with. Do not call any tool for this message.");

    const transcript = await page.evaluate(() => window.__kg.agent.state.transcript);
    const last = transcript[transcript.length - 1];
    assert.equal(last.role, "assistant");
    // Loose but real: a genuine Hungarian reply of any real length almost
    // always contains at least one of these diacritics, which essentially
    // never appear in an English reply -- a robust signal without needing
    // an exact-text match against non-deterministic model output.
    assert.match(last.text, /[áéíóöőúüű]/i, `expected a Hungarian reply, got: ${last.text}`);
  }, { lang: "hu" });
});

// Regression coverage for a third real bug the live suite's own broader
// sibling -- the ontology-recovery eval's first full 100-turn run -- found
// in itself: apply_ontology_yaml's tool schema and system prompt both
// promise "only include entries that are new or have changed... does not
// need to restate everything," but commitYamlImport's old "merge" mode did
// a wholesale field replace on any matched class, silently wiping meaning
// and previously-added properties whenever a real model correctly followed
// that instruction and sent a minimal diff. Fixed via a new "agent-merge"
// mode (index.html's commitYamlImport, used only by this tool); mocked
// regression coverage lives in tests/helper-agent-phase3.spec.mjs. This is
// the live confirmation that two real, independently-prompted tool calls
// against the same class actually compose correctly against the genuine
// API, not just against hand-authored mock responses.
test("live: two real, separate tool calls against the same class compose — the second doesn't erase what the first added", { skip }, async () => {
  await withPage(async (page) => {
    await connectAgentLive(page, OPENAI_API_KEY);
    forwardToRealOpenAi(page, CHAT_URL);

    await sendChatMessage(
      page,
      "Add a class called Incident, meaning: An unplanned service disruption. Give it one property called " +
      "status (type text). Use apply_ontology_yaml right now."
    );
    await sendChatMessage(
      page,
      "Now also add a property called severity (type text) to the Incident class. Use apply_ontology_yaml " +
      "right now — only include the new property, you don't need to restate the class's meaning or its " +
      "other property."
    );

    const incident = await page.evaluate(() => window.__kg.state.nodes.find((n) => n.label === "Incident"));
    assert.ok(incident, "the Incident class should exist after the first call");
    // Robust to either safe strategy a real model might take (relying on
    // the merge, or defensively resending the meaning anyway) -- what must
    // hold regardless is that it survives as a real, non-empty value.
    assert.ok(typeof incident.meaning === "string" && incident.meaning.trim().length > 0,
      `expected the Incident class to still have a meaning after the second call, got: ${JSON.stringify(incident.meaning)}`);
    const propNames = incident.properties.map((p) => p.name.toLowerCase());
    assert.ok(propNames.includes("status"), `expected the first call's "status" property to survive, got: ${JSON.stringify(propNames)}`);
    assert.ok(propNames.includes("severity"), `expected the second call's "severity" property to be added, got: ${JSON.stringify(propNames)}`);
  });
});
