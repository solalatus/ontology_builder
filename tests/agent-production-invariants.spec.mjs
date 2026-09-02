import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { withPage } from "./lib/page.mjs";

// HARD REGRESSION GUARDS ON THE PRODUCTION INTERVIEWER (issue #75 §1)
//
// The post-interview structural normalization experiment (issue #75,
// tests/evals/post-normalization.mjs) is an *eval-only* condition: it must be
// possible to state, and to check mechanically, that the shipped interviewer
// did not change while it ran. These are the checks. They are in the default
// suite, not under tests/evals/, because the invariant they protect is a
// property of the production app rather than of the experiment -- it should
// fail on an ordinary CI run, not only when someone remembers to run the evals.
//
// Both assertions are offline: no API key, no network, no model call.
//
// WHEN THIS FAILS
// ---------------
// A failure here means the interviewer's system prompt or its tool surface
// changed. That is not automatically wrong -- the prompt is legitimately
// evolved over time -- but it is never a formality:
//
//   * Any intentional change makes a NEW TREATMENT. The eval's anchor
//     distribution (tests/evals/results/runs/run-01..03) was produced under the
//     prompt whose hash is below; comparing a later interview against those
//     three runs is only meaningful if the prompt matched, so an intentional
//     change needs a fresh non-regression evaluation before its numbers are
//     compared to anything (EXPERIMENT_BRIEF.md §4.3, issue #75 §17).
//   * If the change was NOT intentional, do not update the constants to make
//     the test pass. Issue #75 §1 says this in as many words: "Do not update
//     the golden hash to accommodate an accidental prompt change." Revert the
//     prompt instead.
//
// So: update the hash below in the same commit that deliberately changes the
// prompt, say so in the commit message, and re-run the anchor evaluation.

// SHA-256 of window.__kg.agent.buildSystemPrompt() -- AGENT_SYSTEM_PROMPT_BASE
// + AGENT_KNOWLEDGE + the output-language directive, exactly as sent to the
// model on a real request. Recorded per language because the directive names
// the language (agentLanguageDirective()), so the two differ by design.
//
// Updated deliberately (issue #144): AGENT_KNOWLEDGE's own baked "how to
// describe a domain" howto used a running procurement example --
// Invoice/Supplier/Employee/Purchase order -- that turned out to overlap
// real vocabulary in 2 of the 5 benchmark domains: iof-supply-chain's own
// `Supplier` class and `PurchaseOrder` class (an exact match, not just a
// shared root), and itops's own `Vendor` class, whose alias is literally
// "supplier". Sent to the interviewer verbatim on every single run
// regardless of domain, this is a more direct leak channel than the
// pretraining-contamination question issue #133 characterized -- not "the
// model may have seen this during training" but "the model is handed this
// content directly, in its own system prompt, on this exact run."
// `Supplier`/`vendor` -> `Manufacturer`/`producer`, `Purchase order` ->
// `Requisition`, mechanically verified to share no class/relationship/
// property name (or camelCase-split component word) with any of the 5
// domains' own `reference.domain.yaml` files. Same shape throughout (a
// class with a meaning and alias, a relationship, decision-relevant
// properties) -- only the vocabulary changed, not the howto's own content
// or structure. A live non-regression evaluation against the anchor
// distribution (tests/evals/results/runs/run-01..03) is the right next step
// before this prompt's own numbers are compared to anything, but was not
// run in this same pass -- explicitly deferred in issue #144's own filing
// (no full live benchmark budget available at the time; see
// ontology_translation/TODO.md's dated entry). Issue #144's own proposed
// standing mechanical overlap-check test was also not added here: a first
// attempt at one (naive whole-word overlap between AGENT_KNOWLEDGE and the
// 5 domains' vocabularies) flagged dozens of ordinary shared English
// modeling words -- "date", "amount", "status", "type", "for" -- that any
// howto discussing properties in general will inevitably share with real
// domains that also have dated/amount/status-shaped properties; building a
// version that distinguishes the illustrative example's own proper nouns
// from that generic scaffolding is real design work, deliberately left for
// a follow-up rather than shipped half-tuned here.
//
// Updated again (elicitation-improvement epic, #152): a full domain-
// neutrality review (prompted by explicit standing policy: no ontology/
// domain-specific language may appear in any prompt or procedure) scanned
// every LLM-facing prompt's entity vocabulary against all 5 benchmark
// domains' real class/relationship names+aliases, using the same
// methodology issue #144's own standing overlap-check test already
// established (entity-only, >=4 chars, to avoid the documented generic-
// English-word false-positive storm). Found one genuine, pre-existing leak
// this narrower, GROUND-RULES-only-scoped test never covered: the
// "near-synonyms" guidance bullet used a concrete illustrative example --
// "supplier" vs "vendor" vs "counterparty" -- that is real vocabulary in
// itops (Vendor, alias "supplier") and plausibly finance-domain phrasing
// (counterparty), sitting one bullet above the very "never reach for a
// specific domain's vocabulary... use an abstract placeholder" rule it
// violated. Replaced with a fully abstract description ("two terms the
// expert has used that sound interchangeable"), no illustrative words at
// all -- no live non-regression evaluation run for this specific wording
// change alone (folded into the epic's own end-of-epic full benchmark
// gate instead, per that epic's own budget discipline).
//
// Updated again (elicitation-improvement epic, #152, tickets #154+#159):
// Phase 3's "two classes that appear together in the same competency
// question or action almost always need a direct relationship between
// them specifically" assumption is replaced with path-first elicitation --
// ask how two jointly-mentioned classes actually connect before assuming
// the connection is direct, and only commit a direct edge once the expert
// explicitly confirms that exact fact independently of whatever path was
// already recorded (#159: precision fix, guards against inventing direct
// edges between concepts that are really only indirectly connected).
// Layered with #154: the same jointly-mentioned-pair/path check is now a
// standing obligation repeated after every later phase that introduces a
// class which did not exist the last time it ran, not a one-time Phase 3
// pass -- Phase 9(b)'s final checklist was updated to match both changes.
// Designed and shipped together per the epic's own note that these two
// tickets touch the same Phase 3 logic and would fight each other as
// independent diffs. No live non-regression evaluation run for this
// specific wording change alone -- folded into the epic's own end-of-epic
// full benchmark gate instead, per that epic's own budget discipline.
//
// Updated again (elicitation-improvement epic, #152, ticket #156): Phase
// 9(b)'s final checklist now tells the interviewer to call get_graph_state
// with finalValidation:true, which additionally runs one automatic Tier C
// (LLM second-opinion) review of the whole ontology, at most once per
// conversation. Findings are surfaced through the same tool result the
// deterministic consistency sweep already uses, with the same fix-forward
// discipline as issue #84's self-correction loop (never resolve a finding
// by weakening/deleting the item it is about). get_graph_state's own tool
// schema gained the optional finalValidation boolean parameter to carry
// this signal -- PRODUCTION_TOOL_NAMES (below) is unaffected, since tool
// *names* didn't change, only one tool's parameters. No live non-regression
// evaluation run for this specific wording change alone -- folded into the
// epic's own end-of-epic full benchmark gate instead, per that epic's own
// budget discipline; a live mocked-model test suite
// (tests/agent-final-validation-tierc.spec.mjs) does directly confirm the
// mechanism (one bounded Tier C call, findings surfaced, no retry loop).
//
// Updated again (elicitation-improvement epic, #152, ticket #160): a new
// Phase 9(b) -- bounded domain-expansion pass -- was inserted into the
// Validation pass, between the pre-existing competency check (now still
// 9(a)) and the pre-existing final checklist (renumbered 9(b)->9(c), no
// content change beyond one new checklist item confirming 9(b) actually
// ran). Runs once, only after 9(a) finds every competency question and
// action covered: for each major class, silently checks a fixed, generic
// checklist of neighboring structures (parts/components, lifecycle
// states, actors, inputs/outputs, related paperwork/agreements,
// measurements, earlier/later workflow stages -- explicitly NOT
// "subtypes or variants", ticket #160's own listed category, which is
// deliberately skipped: it has nowhere to be recorded until #155's
// parked specialization-construct design question is resolved, per that
// ticket's own stated fallback), offers only the categories that plausibly
// apply, once per major concept, and requires the expert's explicit
// confirmation before adding anything -- never bypasses the ordinary
// per-item phases (Phase 3's path check, Phase 4's competency-question
// trace) for whatever it surfaces. Default-on (not opt-in) and its
// evaluation folded into the epic's own end-of-epic full benchmark gate
// rather than a separate pre-registered n>=5 run -- both explicit,
// deliberate scope decisions made with the maintainer before implementing,
// not silently assumed. Two illustrative words in an early draft of this
// phase's own wording ("documents", "processes") turned out to be exact
// relationship names in itops's own reference ontology (`documents`,
// `processes`) rather than safely generic English -- caught by the same
// standing full-prompt vocabulary scan #152's earlier hash update
// established, replaced with "paperwork"/"workflow stages" instead, no
// exact-match overlap with any of the 5 domains. Report **both**
// full-domain and practical-scope F1 deltas separately for this ticket at
// gate time, per its own explicit acceptance criterion -- a full-domain-
// only report would misrepresent the tradeoff the ticket itself expects
// (this pass very likely raises full-domain recall while being closer to
// neutral, or slightly negative on precision, for practical-scope F1).
//
// Previous hashes (7bf30dd2…/22f89f79…) were the #156 Tier C
// final-validation wiring recorded just before this change.
export const PRODUCTION_SYSTEM_PROMPT_SHA256 = {
  en: "cf492ad0b6bb60983ff8342b000c12085f8e84d35859048aa33cdf1271d82313",
  hu: "acff5f52d79567e9928595bd905abd7310ad5229322f1ea7da29067716e6bb55",
};

// The complete ontology tool surface an ordinary interview request exposes.
// Issue #75 §1: an interview must expose exactly these and no normalization
// tool. Order matters here on purpose -- it is the order the app sends, and
// pinning it means the assertion fails on a reordering too, which is the
// cheapest way to notice that this array was edited at all. Grew to three
// (issue #140 follow-up, see PRODUCTION_SYSTEM_PROMPT_SHA256's own comment
// just above for the full story): remove_ontology_elements, appended last
// to match the literal order the "tools:" array is constructed in the live
// interview's own tool-calling loop.
export const PRODUCTION_TOOL_NAMES = ["apply_ontology_yaml", "get_graph_state", "remove_ontology_elements"];

const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

for (const lang of ["en", "hu"]) {
  test(`production interviewer system prompt is byte-identical to the recorded ${lang} golden hash`, async () => {
    await withPage(async (page) => {
      const prompt = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
      assert.equal(
        sha256(prompt), PRODUCTION_SYSTEM_PROMPT_SHA256[lang],
        `the production interviewer prompt (${lang}) changed -- see this file's header before touching the constant`
      );
    }, { lang });
  });
}

test("an ordinary interview request exposes exactly the two ontology tools, and no normalization tool", async () => {
  await withPage(async (page) => {
    await page.route(MODELS_URL, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1715000000, object: "model", owned_by: "openai" }] }),
    }));

    // Captures the real outgoing request body rather than reading a constant
    // out of the page: what matters is the tool list the app actually sends on
    // a live interview turn, which is assembled at call time in
    // sendAgentChatMessage() and is not otherwise observable.
    const requestBodies = [];
    await page.route(CHAT_URL, (route) => {
      requestBodies.push(route.request().postDataJSON());
      route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          id: "chatcmpl-test", object: "chat.completion",
          choices: [{ index: 0, message: { role: "assistant", content: "Understood." }, finish_reason: "stop" }],
        }),
      });
    });

    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.fill("#agent-chat-input", "Let's start the interview.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => window.__kg.agent.isSending() === false);

    assert.equal(requestBodies.length, 1, "expected exactly one chat request for one user turn");
    const tools = requestBodies[0].tools || [];
    assert.deepEqual(
      tools.map((t) => t.function.name), PRODUCTION_TOOL_NAMES,
      "the interviewer's tool surface changed -- see this file's header before touching the constant"
    );
    assert.equal(
      tools.some((t) => /normal/i.test(t.function.name)), false,
      "a normalization tool is reachable from an ordinary interview request; issue #75 requires normalization to stay outside the interviewer"
    );

    // The system message the app actually sends must be the same prompt the
    // hash tests above pin -- otherwise the two guards could pass while a
    // different prompt went out on the wire.
    const systemMessage = requestBodies[0].messages.find((m) => m.role === "system");
    assert.equal(sha256(systemMessage.content), PRODUCTION_SYSTEM_PROMPT_SHA256.en);
  });
});
