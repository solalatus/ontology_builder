import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "./lib/server.mjs";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, addNodeViaDblClick, createEdgeViaConnectMode, waitForDownloads } from "./lib/page.mjs";

// Issue #165: the toolbar's Export button (formerly "Save Version") opens a
// modal with two choices -- "Results only" (exactly the three files it always
// wrote) and "Whole conversation and session results" (those three plus one
// .session.json bundle with the Helper Agent conversation and the latest
// check results, never the API key or connection settings).

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function withExportPage(fn, { lang = "en", initScript = null, url = APP_URL } = {}) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  if (initScript) await page.addInitScript(initScript.fn, initScript.arg);
  await page.goto(url);
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate((l) => { if (window.__kg.lang.get() !== l) window.__kg.lang.toggle(); }, lang);
  await page.evaluate(() => window.__kg.welcome.close());
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

const overlayDisplay = (page) => page.evaluate(() => getComputedStyle(document.getElementById("export-overlay")).display);
const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

// A realistic conversation: UI transcript plus the API-level history with an
// assistant tool call and its tool result, the shape sendAgentChatMessage()
// itself appends.
async function seedConversation(page) {
  await page.evaluate(() => {
    const s = window.__kg.agent.state;
    s.transcript.push({ role: "user", text: "We track invoices from manufacturers." });
    s.transcript.push({ role: "assistant", text: "Added Invoice and Manufacturer." });
    s.apiMessages.push({ role: "user", content: "We track invoices from manufacturers." });
    s.apiMessages.push({
      role: "assistant", content: null,
      tool_calls: [{ id: "call_1", type: "function", function: { name: "apply_ontology_yaml", arguments: "{\"yaml\":\"classes:\\n  Invoice: {}\"}" } }],
    });
    s.apiMessages.push({ role: "tool", tool_call_id: "call_1", content: "{\"ok\":true,\"applied\":[\"Invoice\"]}" });
    s.apiMessages.push({ role: "assistant", content: "Added Invoice and Manufacturer." });
  });
}

async function exportWholeSession(page, downloads, expected = 4) {
  const before = downloads.length;
  await page.click("#btn-save-version");
  await page.click("#export-whole-session");
  await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
  await waitForDownloads(downloads, before + expected);
  return downloads.slice(before);
}

test("the toolbar button is labelled Export / Exportálás and opens the export modal with both choices, localised", async () => {
  await withExportPage(async (page) => {
    assert.equal(await page.locator("#btn-save-version").textContent(), "Export");
    assert.equal(await overlayDisplay(page), "none");
    await page.click("#btn-save-version");
    assert.equal(await overlayDisplay(page), "flex");
    assert.equal(await page.locator("#export-results-only").textContent(), "Results only");
    assert.equal(await page.locator("#export-whole-session").textContent(), "Whole conversation and session results");
    assert.equal(await page.locator("#export-cancel").textContent(), "Cancel");
    assert.match(await page.locator("#export-intro").textContent(), /API key and connection settings are never included/);
    await page.click("#export-cancel");

    await page.click("#btn-lang-toggle"); // -> hu
    assert.equal(await page.locator("#btn-save-version").textContent(), "Exportálás");
    await page.click("#btn-save-version");
    assert.equal(await page.locator("#export-title").textContent(), "Exportálás");
    assert.equal(await page.locator("#export-results-only").textContent(), "Csak az eredmények");
    assert.equal(await page.locator("#export-whole-session").textContent(), "A teljes beszélgetés és a munkamenet eredményei");
    assert.equal(await page.locator("#export-cancel").textContent(), "Mégse");
    assert.match(await page.locator("#export-intro").textContent(), /API kulcs/);
    await page.click("#export-cancel");
  });
});

test("Cancel, Escape and a backdrop click all close the modal without writing anything or bumping the version", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const version = () => page.evaluate(() => (window.__kg.state.meta ? window.__kg.state.meta.version : 0));
    const v0 = await version();

    await page.click("#btn-save-version");
    await page.click("#export-cancel");
    assert.equal(await overlayDisplay(page), "none");

    await page.click("#btn-save-version");
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page), "none");

    await page.click("#btn-save-version");
    await page.mouse.click(10, 790); // the overlay, away from the dialog
    assert.equal(await overlayDisplay(page), "none");

    await page.waitForTimeout(300); // give any (wrongly) triggered download time to surface
    assert.equal(downloads.length, 0);
    assert.equal(await version(), v0);
  });
});

test("Results only writes exactly the three files it always wrote, and no session bundle", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await seedConversation(page); // a conversation exists, and is still not exported
    await page.click("#btn-save-version");
    await page.click("#export-results-only");
    await waitForDownloads(downloads, 3);
    await page.waitForTimeout(300);
    const names = downloads.map((d) => d.suggestedFilename()).sort();
    assert.equal(names.length, 3);
    assert.match(names[0], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.domain\.yaml$/);
    assert.match(names[1], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.json$/);
    assert.match(names[2], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.txt$/);
  });
});

test("Whole session writes the three files plus one .session.json with the same versioned base name", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const files = await exportWholeSession(page, downloads);
    const names = files.map((d) => d.suggestedFilename()).sort();
    assert.equal(names.length, 4);
    const base = names[0].replace(/\.domain\.yaml$/, "");
    assert.deepEqual(names, [`${base}.domain.yaml`, `${base}.json`, `${base}.session.json`, `${base}.txt`]);
    assert.match(base, /^Untitled-Graph_v0001_/);
    assert.equal(await page.evaluate(() => window.__kg.state.meta.version), 1, "one export, one version bump");
  });
});

test("the session bundle has the documented shape, and its exports are byte-identical to the three files written alongside it", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 250, 250, "Invoice");
    await addNodeViaDblClick(page, 700, 250, "Manufacturer");
    await createEdgeViaConnectMode(page, 250, 250, 700, 250, "issued by");
    await page.evaluate(() => { window.__kg.actions.createCompetencyQuestion("Which invoices are overdue?"); window.__kg.markDirty(); });
    const files = await exportWholeSession(page, downloads);
    const byExt = (ext) => files.find((d) => d.suggestedFilename().endsWith(ext));
    const bundle = JSON.parse(await readDownload(byExt(".session.json")));

    assert.equal(bundle.format, "kg-session-bundle");
    assert.equal(bundle.format_version, 1);
    assert.equal(bundle.app.name, "Knowledge Graph Canvas");
    assert.equal(bundle.app.file, "index.html");
    assert.equal(bundle.app.language, "en");
    assert.match(bundle.saved_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(bundle.graph_meta.version, 1);
    assert.equal(bundle.graph_meta.saved, bundle.saved_at);

    assert.equal(bundle.exports.json.content, await readDownload(byExt(".json")));
    assert.equal(bundle.exports.txt.content, await readDownload(byExt(".txt")));
    assert.equal(bundle.exports.domain_yaml.content, await readDownload(byExt(".domain.yaml")));
    assert.equal(bundle.exports.json.filename, byExt(".json").suggestedFilename());
    assert.equal(bundle.exports.domain_yaml.filename, byExt(".domain.yaml").suggestedFilename());

    assert.ok(Array.isArray(bundle.conversation.transcript));
    assert.ok(Array.isArray(bundle.conversation.api_messages));
    assert.ok(Array.isArray(bundle.checks.consistency));
    assert.ok(Array.isArray(bundle.checks.consistency_llm));
    assert.ok(Array.isArray(bundle.checks.cq_coverage));
    // Not connected: no model, no provider claimed.
    assert.equal(bundle.interviewer.model, null);
    assert.equal(bundle.interviewer.provider, null);
  });
});

test("the bundle round-trips the transcript and the API messages (tool calls and tool results included) unchanged", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    await seedConversation(page);
    const live = await page.evaluate(() => ({
      transcript: window.__kg.agent.state.transcript, apiMessages: window.__kg.agent.state.apiMessages,
    }));
    const files = await exportWholeSession(page, downloads);
    const bundle = JSON.parse(await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json"))));
    assert.deepEqual(bundle.conversation.transcript, live.transcript);
    assert.deepEqual(bundle.conversation.api_messages, live.apiMessages);
    assert.equal(bundle.conversation.api_messages[1].tool_calls[0].function.name, "apply_ontology_yaml");
    assert.equal(bundle.conversation.api_messages[2].role, "tool");
  });
});

test("the bundle records the interviewer's system prompt exactly as the page builds it, with a correct SHA-256 -- and exporting does not change it", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const promptBefore = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
    const files = await exportWholeSession(page, downloads);
    const bundle = JSON.parse(await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json"))));
    const promptAfter = await page.evaluate(() => window.__kg.agent.buildSystemPrompt());
    assert.equal(bundle.interviewer.system_prompt, promptBefore);
    assert.equal(bundle.interviewer.system_prompt_sha256, sha256(promptBefore));
    assert.equal(promptAfter, promptBefore, "exporting leaves the interviewer prompt untouched");
  });
});

test("the bundle never contains the API key, the Azure endpoint, or anything shaped like an sk- secret -- even one pasted into the chat", async () => {
  const KEY = "sk-proj-THISISASECRETKEY0123456789abcdef";
  const ENDPOINT = "https://my-secret-resource.openai.azure.com";
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await seedConversation(page);
    await page.evaluate(({ key, endpoint }) => {
      const s = window.__kg.agent.state;
      s.apiKey = key;
      s.azureEndpoint = endpoint;
      s.azureApiVersion = "2025-01-01-preview";
      s.model = "gpt-test-deployment";
      s.connected = true;
      // A user pasting their own key into the chat, and the agent echoing it.
      s.transcript.push({ role: "user", text: `my key is ${key}, also sk-another0123456789ABCDEFxyz` });
      s.apiMessages.push({ role: "user", content: `my key is ${key} at ${endpoint}` });
    }, { key: KEY, endpoint: ENDPOINT });
    const files = await exportWholeSession(page, downloads);
    const text = await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json")));
    assert.equal(text.includes(KEY), false, "the live API key must never appear");
    assert.equal(text.includes(ENDPOINT), false, "the Azure endpoint must never appear");
    assert.equal(text.includes("my-secret-resource"), false);
    assert.equal(/sk-[A-Za-z0-9_-]{16,}/.test(text), false, "no sk- shaped secret may appear");
    assert.equal(text.includes("2025-01-01-preview"), false, "no other connection setting either");
    const bundle = JSON.parse(text);
    assert.equal(bundle.interviewer.model, "gpt-test-deployment", "the model name is the one connection detail kept");
    assert.equal(bundle.interviewer.provider, "azure");
    assert.ok(text.includes("[redacted]"), "the pasted key was redacted, not silently dropped");
    // The live in-memory conversation itself is not modified by the export.
    const live = await page.evaluate(() => window.__kg.agent.state.transcript.at(-1).text);
    assert.ok(live.includes(KEY));
  });
});

test("the bundle reports the OpenAI provider when connected without an Azure endpoint", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => {
      const s = window.__kg.agent.state;
      s.apiKey = "sk-openai-key-0123456789abcdefghij";
      s.model = "gpt-5.5";
      s.connected = true;
    });
    const files = await exportWholeSession(page, downloads);
    const bundle = JSON.parse(await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json"))));
    assert.equal(bundle.interviewer.provider, "openai");
    assert.equal(bundle.interviewer.model, "gpt-5.5");
  });
});

test("the bundle's consistency findings are the checker's current findings for the exported model", async () => {
  await withExportPage(async (page, downloads) => {
    // A rule requiring a value its own property does not allow -- a
    // contradiction the deterministic checker provably reports.
    await page.evaluate(() => window.__kg.formats.commitYamlImport(
      "classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed:\n          - new\n" +
      "relationships: []\nrules:\n  canClose:\n    conditions:\n      - Incident status is archived.\n" +
      "actions:\n  close:\n    input: Incident\n    preconditions:\n      - canClose\n    effect: e\n    verification: v\n",
      "replace",
    ));
    const expected = await page.evaluate(() => window.__kg.consistency.forCurrentGraph().length);
    assert.ok(expected > 0, "sanity: this model has at least one finding");
    const files = await exportWholeSession(page, downloads);
    const bundle = JSON.parse(await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json"))));
    assert.equal(bundle.checks.consistency.length, expected);
  });
});

function installMockPicker({ name = "MockFolder" } = {}) {
  return {
    arg: { name },
    fn: ({ name }) => {
      window.__mockFolderWrites = {};
      window.showDirectoryPicker = async () => ({
        name,
        async getFileHandle(filename) {
          return {
            async createWritable() {
              return { async write(content) { window.__mockFolderWrites[filename] = content; }, async close() {} };
            },
          };
        },
      });
    },
  };
}

test("with Folder Sync granted, Whole session writes all four files to the folder and downloads nothing", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await seedConversation(page);
    await page.click("#btn-folder-sync");
    await page.waitForFunction(() => window.__kg.tier2.getDirHandle() !== null);
    await page.click("#btn-save-version");
    await page.click("#export-whole-session");
    await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
    const writes = await page.evaluate(() => window.__mockFolderWrites);
    const names = Object.keys(writes).sort();
    assert.equal(names.length, 4);
    assert.ok(names.some((n) => n.endsWith(".session.json")));
    const bundle = JSON.parse(writes[names.find((n) => n.endsWith(".session.json"))]);
    assert.equal(bundle.conversation.transcript.length, 2);
    assert.equal(bundle.exports.json.content, writes[names.find((n) => n.endsWith(".json") && !n.endsWith(".session.json"))]);
    await page.waitForTimeout(300);
    assert.equal(downloads.length, 0);
  }, { initScript: installMockPicker() });
});

test("with Folder Sync granted, Results only still writes exactly three files to the folder", async () => {
  await withExportPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-folder-sync");
    await page.waitForFunction(() => window.__kg.tier2.getDirHandle() !== null);
    await page.click("#btn-save-version");
    await page.click("#export-results-only");
    await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
    const names = Object.keys(await page.evaluate(() => window.__mockFolderWrites));
    assert.equal(names.length, 3);
    assert.equal(names.some((n) => n.endsWith(".session.json")), false);
  }, { initScript: installMockPicker() });
});

test("consecutive exports keep one shared version counter across both modes", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-save-version");
    await page.click("#export-results-only");
    await waitForDownloads(downloads, 3);
    await exportWholeSession(page, downloads);
    const sessionName = downloads.find((d) => d.suggestedFilename().endsWith(".session.json")).suggestedFilename();
    assert.match(sessionName, /_v0002_/);
  });
});

test("opened from file://, the bundle omits the page's own source hash and the page logs no error trying", async () => {
  await withExportPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const files = await exportWholeSession(page, downloads);
    const bundle = JSON.parse(await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json"))));
    assert.equal(bundle.app.index_html_sha256, null);
  });
});

test("served over http, the bundle records the SHA-256 of the exact index.html bytes the page was loaded from", async () => {
  const server = await startStaticServer(path.resolve(__dirname, ".."));
  try {
    await withExportPage(async (page, downloads) => {
      await addNodeViaDblClick(page, 300, 300, "Alpha");
      const files = await exportWholeSession(page, downloads);
      const bundle = JSON.parse(await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json"))));
      const bytes = fs.readFileSync(path.resolve(__dirname, "..", "index.html"));
      assert.equal(bundle.app.index_html_sha256, crypto.createHash("sha256").update(bytes).digest("hex"));
    }, { url: `${server.url}/index.html` });
  } finally {
    await server.close();
  }
});

// The LLM-backed check results ride along too, once run. Same mocked-OpenAI
// pattern tests/cq-coverage.spec.mjs uses.
test("after a (mocked) coverage check run, the bundle carries its results verbatim, plus the real connected model/provider", async () => {
  await withExportPage(async (page, downloads) => {
    await page.route("https://api.openai.com/v1/models", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
    }));
    const verdicts = "```json\n" + JSON.stringify([
      { cq_id: "cq1", status: "covered", evidence: ["SupportRequest", "EscalationPolicy"], gap: "" },
    ]) + "\n```";
    await page.route("https://api.openai.com/v1/chat/completions", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ choices: [{ index: 0, message: { role: "assistant", content: verdicts }, finish_reason: "stop" }] }),
    }));
    await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.evaluate(() => window.__kg.formats.commitYamlImport([
      "competency_questions:",
      "  - text: Which escalation policy applies to this support request?",
      "classes:",
      "  SupportRequest: {}",
      "  EscalationPolicy: {}",
      "relationships:",
      "  - name: escalatesUnder",
      "    from: SupportRequest",
      "    to: EscalationPolicy",
      "",
    ].join("\n"), "merge"));
    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.cqCoverage.run());
    await page.waitForFunction(() => !window.__kg.consistency.cqCoverage.isPending());
    const results = await page.evaluate(() => window.__kg.consistency.cqCoverage.results());
    assert.equal(results.length, 1, "sanity: the coverage check produced a result");
    await page.evaluate(() => window.__kg.consistency.close());

    const files = await exportWholeSession(page, downloads);
    const text = await readDownload(files.find((d) => d.suggestedFilename().endsWith(".session.json")));
    const bundle = JSON.parse(text);
    assert.deepEqual(bundle.checks.cq_coverage, results);
    assert.equal(bundle.interviewer.model, "gpt-4o-mini");
    assert.equal(bundle.interviewer.provider, "openai");
    assert.equal(text.includes("sk-test-key"), false, "a short key is still scrubbed by exact match");
  });
});
