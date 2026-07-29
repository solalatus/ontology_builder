import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRawFixtureText } from "./groundTruthModel.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PERSONA_PATH = path.resolve(__dirname, "..", "fixtures", "persona-eszter.md");
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

// The persona prompt's own scripted opening line (persona-eszter.md's
// "Opening response" section) -- used verbatim as the conversation seed
// rather than generated, since the persona document specifies it exactly.
export const OPENING_LINE =
  "I lead IT operations governance and major-incident management for the bank. I can walk you through how " +
  "we structure services and technical dependencies, how we detect and manage incidents, who owns decisions, " +
  "how recovery and emergency changes work, and how we handle evidence, communications, reviews, and " +
  "regulatory-reporting workflows. Where would you like to start?";

function buildSystemPrompt() {
  const personaText = fs.readFileSync(PERSONA_PATH, "utf8");
  const groundTruthYaml = loadRawFixtureText();
  // The persona doc says the reference file is "present alongside this
  // prompt" -- literally true here: embedded directly below it, exactly as
  // the persona's own hidden-ground-truth rule expects.
  return `${personaText}\n\n---\n\n# hungarian_bank_itops_incident_response_mtsr.yaml\n\n\`\`\`yaml\n${groundTruthYaml}\n\`\`\`\n`;
}

// A plain Node-side Chat Completions loop simulating Eszter -- no browser
// involved (unlike the app agent under test), since this is a test fixture,
// not the production code path being evaluated. Node's own fetch() reaches
// the real OpenAI API directly in this sandbox (confirmed while building
// the live-openai suite), so no relay trick is needed here.
export function createPersonaAgent({ apiKey, model }) {
  const messages = [{ role: "system", content: buildSystemPrompt() }];

  async function reply(incomingText) {
    messages.push({ role: "user", content: incomingText });
    const res = await fetch(CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`persona agent call failed: HTTP ${res.status} ${data && data.error && data.error.message}`);
    }
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    messages.push({ role: "assistant", content: text });
    return { text, usage: data.usage || null };
  }

  return { reply, messages };
}
