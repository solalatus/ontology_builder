import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRawFixtureText } from "./groundTruthModel.mjs";
import { renderNaturalLanguageBriefing } from "./groundTruthBriefing.mjs";
import { RATE_LIMIT_MAX_ATTEMPTS, rateLimitBackoffMs, sleepMs, isInsufficientQuotaError } from "../../lib/liveOpenAi.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PERSONA_PATH = path.resolve(__dirname, "..", "fixtures", "persona-eszter.md");
// Exported for issue #133/E8: provenance needs to hash the exact wrapper
// file text a run actually used (persona-experiment-wrapper.md content
// changes -- E11/E12/item-2 fixes among them -- should show up as a
// different wrapperSha256 in a run's own provenance.json).
export const WRAPPER_PATH = path.resolve(__dirname, "..", "fixtures", "persona-experiment-wrapper.md");
const DEFAULT_GROUND_TRUTH_FILENAME = "hungarian_bank_itops_incident_response_mtsr.yaml";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

// The itops persona's own scripted opening line (persona-eszter.md's
// "Opening response" section) -- used verbatim as the conversation seed
// rather than generated, since that document specifies it exactly and it
// already reads well; kept as a literal constant (not parsed out of the
// file) exactly as before issue #104. Any other domain's persona.md has no
// equivalent hand-authored section, so its opening line is instead derived
// mechanically -- see deriveOpeningLine below.
export const OPENING_LINE =
  "I lead IT operations governance and major-incident management for the bank. I can walk you through how " +
  "we structure services and technical dependencies, how we detect and manage incidents, who owns decisions, " +
  "how recovery and emergency changes work, and how we handle evidence, communications, reviews, and " +
  "regulatory-reporting workflows. Where would you like to start?";

// Every domain's persona.md (ontology_translation/domains/*/persona.md)
// opens with a "## Who they are" section written in second person ("You
// lead maintenance and reliability for..."). Rather than requiring every
// domain to also hand-author a scripted "Opening response" paragraph (a
// new authoring step every future domain's persona.md would have to
// remember, on top of the one it already has), this derives a serviceable
// opening line mechanically: the "Who they are" section's own first
// sentence or two, turned from second- to first-person ("You lead..." ->
// "I lead..."), plus a fixed generic invitation to start. Good enough to
// seed a natural-sounding conversation opener without requiring any edit
// to an already-reviewed persona.md.
export function deriveOpeningLine(personaMarkdownText) {
  const whoSection = personaMarkdownText.match(/##\s*Who they are\s*\n+([\s\S]*?)(?:\n##|\n*$)/i);
  const body = whoSection ? whoSection[1] : personaMarkdownText;
  // First one or two sentences -- enough for a natural-sounding opener
  // without dumping the whole section as a single opening paragraph.
  const sentences = body.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+/g) || [body.trim()];
  const lead = sentences.slice(0, 2).join(" ").trim();
  const firstPerson = lead
    .replace(/\byou're\b/gi, "I'm")
    .replace(/\byou've\b/gi, "I've")
    .replace(/\byou'll\b/gi, "I'll")
    .replace(/\byou'd\b/gi, "I'd")
    // Issue #133/E21 (external audit): the bare "\bYou\b" -> "I" swap below
    // only replaces the pronoun, not the verb that agrees with it -- "You
    // are" became the ungrammatical "I are", "You were" became "I were".
    // Handled as their own two-word replacements, before the bare-pronoun
    // swap, since that swap alone can't also conjugate the following verb.
    .replace(/\byou are\b/gi, "I am")
    .replace(/\byou were\b/gi, "I was")
    .replace(/\bYou\b/g, "I")
    .replace(/\byou\b/g, "I")
    .replace(/\byours\b/gi, "mine")
    .replace(/\byour\b/gi, "my");
  return `${firstPerson} Where would you like to start?`;
}

// Issue #133/E12 item 1 (external audit, root-cause fix): the raw
// `.domain.yaml` file text used to be embedded here verbatim -- every raw
// internal identifier (AirHandlingUnit, hasBorrower, ...) sitting directly
// in the persona's own context, available to be regurgitated regardless of
// what the wrapper prompt asked it not to do (Finding A's real leaks).
// `groundTruthFormat: "domain-yaml"` renders a natural-language-only
// version of the same document first (see groundTruthBriefing.mjs) so there
// is no raw identifier left anywhere in what reaches the model at all.
// Defaults to "mtsr" (embed as-is), matching every existing caller
// (itops's own fixture, and every caller that never passes this) exactly.
function buildSystemPrompt({ personaPath, groundTruthText, groundTruthFilename, groundTruthFormat = "mtsr" } = {}) {
  const resolvedPersonaPath = personaPath || PERSONA_PATH;
  const personaText = fs.readFileSync(resolvedPersonaPath, "utf8");
  const resolvedFilename = groundTruthFilename || DEFAULT_GROUND_TRUTH_FILENAME;
  const wrapperText = fs.readFileSync(WRAPPER_PATH, "utf8").replaceAll("{{GROUND_TRUTH_FILENAME}}", resolvedFilename);
  const rawGroundTruthText = groundTruthText !== undefined ? groundTruthText : loadRawFixtureText();
  const resolvedGroundTruthText = groundTruthFormat === "domain-yaml"
    ? renderNaturalLanguageBriefing(rawGroundTruthText)
    : rawGroundTruthText;

  const [wrapperPurpose, wrapperRest] = wrapperText.split(/\n## Hidden-ground-truth rule\n/);
  const rest = `## Hidden-ground-truth rule\n${wrapperRest}`;

  // The reference file is embedded directly below, exactly as the Purpose
  // section's own hidden-ground-truth rule expects ("present alongside
  // this prompt").
  return `${wrapperPurpose.trim()}\n\n${personaText.trim()}\n\n${rest.trim()}\n\n---\n\n# ${resolvedFilename}\n\n\`\`\`yaml\n${resolvedGroundTruthText}\n\`\`\`\n`;
}

// A plain Node-side Chat Completions loop simulating the persona -- no
// browser involved (unlike the app agent under test), since this is a test
// fixture, not the production code path being evaluated. Node's own
// fetch() reaches the real OpenAI API directly in this sandbox (confirmed
// while building the live-openai suite), so no relay trick is needed here.
// `chat` lets a caller supply the provider call itself -- issue #85 runs the
// whole eval against Azure, where this file's fixed api.openai.com URL and
// Bearer header are simply wrong. Defaults to the OpenAI path every existing
// caller already uses, so nothing else changes.
//
// `personaPath`/`groundTruthText`/`groundTruthFilename` (issue #104):
// generalizes this beyond the itops persona -- any domain's own persona.md
// plus its own reference.domain.yaml's raw text can be substituted, wrapped
// in the same domain-agnostic experiment scaffolding
// (persona-experiment-wrapper.md) itops now shares rather than duplicates.
// `groundTruthFormat` (issue #133/E12 item 1): pass "domain-yaml" alongside
// them so the ground truth actually embedded is the natural-language
// rendering (see buildSystemPrompt above), not the raw file text.
// All three original params default to itops's own values, so every existing call site
// (createPersonaAgent({ apiKey, model })) is completely unaffected.
export function createPersonaAgent({ apiKey, model, chat = null, personaPath, groundTruthText, groundTruthFilename, groundTruthFormat }) {
  const messages = [{ role: "system", content: buildSystemPrompt({ personaPath, groundTruthText, groundTruthFilename, groundTruthFormat }) }];

  // Retries a transient 429 with backoff, same as every other real API call
  // site in the app/test suite (index.html's callAgentChatRaw,
  // tests/lib/liveOpenAi.mjs's relay) -- a real eval run hit this exact gap
  // (this function had no retry at all) when the persona's own direct call
  // failed on a transient rate limit mid-conversation, well past the
  // connect flow the relay already protects. insufficient_quota is still
  // never retried.
  async function reply(incomingText) {
    messages.push({ role: "user", content: incomingText });
    if (chat) {
      const { text, usage } = await chat(messages);
      messages.push({ role: "assistant", content: text });
      return { text, usage: usage || null };
    }
    let res, data;
    for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt++) {
      res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages }),
      });
      data = await res.json();
      if (res.ok) break;
      if (res.status === 429 && attempt < RATE_LIMIT_MAX_ATTEMPTS && !isInsufficientQuotaError(data)) {
        await sleepMs(rateLimitBackoffMs(attempt));
        continue;
      }
      throw new Error(`persona agent call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
    }
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    messages.push({ role: "assistant", content: text });
    return { text, usage: data.usage || null };
  }

  return { reply, messages };
}

// Exported for tests and for callers (e.g. the eval spec) that need the
// assembled prompt itself, not just an agent wrapping it.
export { buildSystemPrompt };
