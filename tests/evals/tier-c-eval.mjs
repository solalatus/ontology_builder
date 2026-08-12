// TIER C EVALUATION (issue #89) — does the optional LLM pass find anything new?
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... node tests/evals/tier-c-eval.mjs
//
// One call per model, over finished ontologies — no interviews. Runs the SAME
// prompt the shipped Tier C uses, read out of index.html rather than copied,
// so this measures the feature rather than a lookalike. Every finding is
// written out next to the deterministic findings for the same model, for
// adjudication by hand into TIER_C_REPORT.md.
//
// Idempotent: a model whose findings file exists is skipped, so a failure
// costs only the call it interrupted.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { launchChromium } from "../lib/browser.mjs";
import { APP_URL } from "../lib/page.mjs";
import { chatOnce, resolveClientConfig } from "./lib/chatClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "results", "baselines", "tier-c");
const MODEL = process.env.TIER_C_MODEL || "gpt-5.4";
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// The nine finished ontologies available: three anchors, six #85 arm models.
const SOURCES = [
  ...["run-01", "run-02", "run-03"].map((r) => ({ id: `anchor-${r}`, file: path.join(__dirname, "results", "runs", r, "recovered-model.yaml") })),
  ...["control", "treatment"].flatMap((arm) => ["run-01", "run-02", "run-03"].map((r) =>
    ({ id: `${arm}-${r}`, file: path.join(__dirname, "results", "baselines", "self-correcting-interviewer", arm, r, "recovered-model.yaml") }))),
].filter((s) => fs.existsSync(s.file));

const config = resolveClientConfig();
fs.mkdirSync(OUT, { recursive: true });

const browser = await launchChromium();
const page = await browser.newPage();
await page.goto(APP_URL);
await page.waitForFunction(() => Boolean(window.__kg));
await page.evaluate(() => window.__kg.welcome.close());
// The shipped prompt, not a copy of it.
const prompt = await page.evaluate(() => window.__kg.consistency.llm.prompt);

for (const source of SOURCES) {
  const outFile = path.join(OUT, `${source.id}.json`);
  if (fs.existsSync(outFile)) { console.log(`${source.id}: already done — skipping`); continue; }
  const yamlText = fs.readFileSync(source.file, "utf8");
  const deterministic = await page.evaluate((y) => {
    window.__kg.formats.openImportDialog(y, "yaml");
    document.getElementById("import-replace").click();
    return window.__kg.consistency.current().filter((f) => f.severity !== "note")
      .map((f) => ({ check: f.check, severity: f.severity, message: f.message }));
  }, yamlText);

  let llm = [], error = null, usage = null;
  try {
    const call = await chatOnce({ config, model: MODEL, systemPrompt: prompt, userPrompt: yamlText, label: source.id });
    usage = call.usage;
    const blocks = [...call.reply.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
    const braced = call.reply.slice(call.reply.indexOf("["), call.reply.lastIndexOf("]") + 1);
    for (const b of [...blocks, braced].filter(Boolean)) {
      try { const v = JSON.parse(b); if (Array.isArray(v)) { llm = v; break; } } catch (e) { /* next */ }
    }
    fs.writeFileSync(path.join(OUT, `${source.id}.raw.md`), call.reply);
  } catch (err) { error = String(err.message).slice(0, 400); }

  fs.writeFileSync(outFile, `${JSON.stringify({
    id: source.id, generatedAt: new Date().toISOString(), model: MODEL,
    promptSha256: sha256(prompt), sourceSha256: sha256(yamlText),
    sourcePath: path.relative(path.join(__dirname, "..", ".."), source.file),
    usage, error,
    deterministicFindings: deterministic,
    llmFindings: llm,
  }, null, 1)}\n`);
  console.log(`${source.id}: ${llm.length} LLM findings vs ${deterministic.length} deterministic${error ? ` (ERROR: ${error})` : ""}`);
}
await browser.close();
