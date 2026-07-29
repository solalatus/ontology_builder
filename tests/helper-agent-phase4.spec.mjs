import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Helper Agent — Phase 4: baked-in knowledge (AGENT_KNOWLEDGE) + the
// INTERVIEW PROCESS system-prompt section. buildAgentSystemPrompt() has no
// dependency on being connected (it only reads the static AGENT_KNOWLEDGE
// constant and the live `lang` value), so these tests call it directly via
// window.__kg.agent.buildSystemPrompt() rather than mocking a full chat
// round-trip — much cheaper, and this is exactly what every real request
// sends as its first message.

async function systemPrompt(page) {
  return page.evaluate(() => window.__kg.agent.buildSystemPrompt());
}

test("the baked-in knowledge includes the full howto guide", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /How to Describe a Domain for an AI Agent/);
    assert.match(prompt, /recognize, connect, compare, decide, or change/);
    // The howto's own complete compact example, verbatim -- proves the
    // whole document is embedded, not a truncated summary of it.
    assert.match(prompt, /canApproveInvoice:\s*\n\s*conditions:/);
  });
});

test("the baked-in knowledge includes the reference Python TXT loader, matching the shipped tool", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /def load_edge_list\(path\):/);
    // The BOM fix (this session's own retrospective-audit fix) must be
    // reflected here too, not a stale pre-fix copy of the loader.
    assert.match(prompt, /encoding="utf-8-sig"/);
  });
});

test("the baked-in knowledge includes a condensed, operational excerpt of the paper — not the full paper", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /Minimal Typed Semantic Representation/);
    assert.match(prompt, /Level 0 — relation backbone/);
    assert.match(prompt, /Level 3 — optional extensions/);
    // Proof this is a condensation, not the full paper: none of the
    // formal apparatus (proofs, benchmark numbers, citations) leaked in.
    assert.doesNotMatch(prompt, /Proposition \d/);
    assert.doesNotMatch(prompt, /WebQSP|ComplexWebQuestions/);
    // Paper's own numbered citation markers, e.g. "[12]" -- excludes code-style
    // array indexing like the loader's own `sys.argv[0]`, which is never
    // preceded by a word character the way a citation bracket is.
    assert.doesNotMatch(prompt, /(?<!\w)\[\d+\]/);
  });
});

test("the system prompt includes the INTERVIEW PROCESS section with all 10 phases (0 through 9)", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /INTERVIEW PROCESS/);
    assert.match(prompt, /0\. Orientation: call get_graph_state first/);
    assert.match(prompt, /1\. Real questions and actions/);
    assert.match(prompt, /9\. Validation pass/);
    assert.match(prompt, /Competency check/);
    assert.match(prompt, /Final checklist/);
  });
});

// Regression coverage for a real interview-pacing inefficiency the
// ontology-recovery eval's own LLM review flagged twice in one run (turns
// 42-89 and 89+): GROUND RULES used to say "Ask ONE focused question at a
// time. Never send a multi-part questionnaire," with no carve-out, so the
// interviewer asked for one class meaning, one alias, or one allowed-value
// list per turn even once the exact same small question had already
// repeated many times. Fixed by allowing batching once a repeating pattern
// is established, while still requiring one-at-a-time for genuinely
// different-in-kind or answer-dependent questions.
test("the system prompt allows batching similar, low-ambiguity items instead of a strict one-question-at-a-time rule", async () => {
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.match(prompt, /batch 3-5 similar,\s*low-ambiguity\s*items/);
    assert.match(prompt, /Never batch items that\s*are different in kind/);
    // The two phases the eval's own real run singled out as the most
    // repetitive (language layer, constraints) call this out explicitly,
    // not just the general ground rule.
    assert.match(prompt, /repeating-pattern case GROUND RULES describes/);
    assert.match(prompt, /Batch the allowed-\s*value question across several properties/);
  });
});

test("the system prompt never reveals the underlying model name or API mechanics that aren't part of the knowledge itself", async () => {
  // Not a security boundary (see SCOPE's own comment on this), just a
  // sanity check that nothing accidentally leaked in from the surrounding
  // JS (e.g. the literal OpenAI endpoint URL, or the agent's own API key).
  await withPage(async (page) => {
    const prompt = await systemPrompt(page);
    assert.doesNotMatch(prompt, /api\.openai\.com/);
    assert.doesNotMatch(prompt, /sk-/);
  });
});

test("the system prompt is stable across repeated calls (proves nothing dynamic leaked into the static knowledge block)", async () => {
  await withPage(async (page) => {
    const first = await systemPrompt(page);
    const second = await systemPrompt(page);
    assert.equal(first, second);
    assert.ok(first.length > 5000, "the real knowledge content should make this a substantial prompt, not a near-empty placeholder");
  });
});

test("toggling the UI language still only changes the OUTPUT LANGUAGE directive, not the knowledge content", async () => {
  await withPage(async (page) => {
    const promptEn = await systemPrompt(page);
    await page.evaluate(() => window.__kg.lang.toggle());
    const promptHu = await systemPrompt(page);

    assert.notEqual(promptEn, promptHu, "the language directive itself must differ");
    // Strip each prompt's own language-directive block and confirm the rest is identical.
    const stripDirective = (s) => s.replace(/---\nOUTPUT LANGUAGE:[\s\S]*?\n---/, "");
    assert.equal(stripDirective(promptEn), stripDirective(promptHu), "the knowledge/instructions content must not depend on the UI language");
  }, { lang: "en" });
});

test("the connected panel's static note reflects that tool-calling has shipped, not stale pre-Phase-3 copy", async () => {
  // Phase 3 shipped apply_ontology_yaml; this note used to say the agent
  // "can only talk for now" and that editing "arrives in a later phase" --
  // stale copy left over from Phase 2 that a Phase 4/5 polish pass must catch.
  await withPage(async (page) => {
    const noteEn = await page.locator("#agent-no-tools-note").textContent();
    assert.doesNotMatch(noteEn, /can only talk for now/);
    assert.doesNotMatch(noteEn, /arrives in a later phase/);
    assert.match(noteEn, /apply changes/);

    await page.evaluate(() => window.__kg.lang.toggle());
    const noteHu = await page.locator("#agent-no-tools-note").textContent();
    assert.doesNotMatch(noteHu, /egyelőre csak beszélget/);
    assert.match(noteHu, /alkalmazhat/);
  }, { lang: "en" });
});
