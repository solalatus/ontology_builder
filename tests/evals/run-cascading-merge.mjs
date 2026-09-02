// CASCADING INTELLIGENT-MERGE MEASUREMENT (issue #147)
//
//   AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_API_KEY=... \
//   node tests/evals/run-cascading-merge.mjs --domain=<id> [--force] \
//     [--sourceResultsDir=<path>] [--sourceRuns=run-01,run-02,run-03] [--outDir=<path>]
//
// WHAT THIS ANSWERS
// ------------------
// Issue #147, itself following from a note in ontology_translation/PAPER_NOTES.md:
// human elicitation practice suggests separate workshop sessions, then
// merged, beat one larger session. Does the same principle transfer to
// *automated* elicitation? This script cascade-merges a domain's 3 existing
// live-interview replicates (already on disk under sourceResultsDir) --
// merge(run-01, run-02), then merge(that result, run-03) -- through the
// app's own real Import Review feature (issue #122/#126: a per-item
// LLM-assisted match/merge review backed by a dedicated execution agent
// with a real delete tool), driven live against real Azure OpenAI, and
// scores both intermediate results with the exact same offline scorer
// every other run in this repo is scored with. The individual replicates'
// own scoring is untouched -- this only adds two new measurements next to
// them, never replaces or re-runs them.
//
// WHY THIS DRIVES THE REAL UI FEATURE INSTEAD OF HAND-ROLLING A MERGE
// ---------------------------------------------------------------------
// The whole point of the measurement is "what recovery does this app's own
// intelligent-merge mechanism actually produce," not "what would some new,
// bespoke merge algorithm produce" -- so this script seeds the canvas with
// one run's saved model (window.__kg.formats.commitYamlImport), then
// drives the exact same window.__kg.importReview.* surface the Playwright
// specs under tests/import-review-*.spec.mjs already exercise (offline,
// mocked there), except live: suggestMatches() for cross-label pairing,
// per-item choice/note decisions, apply(), and confirming the execution
// agent's dry-run preview -- never touching state directly. See
// tests/import-review-hardening.spec.mjs for the offline reference this
// live flow mirrors move-for-move.
//
// DECISION POLICY -- fixed, reproducible, not tuned per domain
// ---------------------------------------------------------------
// A currentOnly item (only one source has it) is always kept; an
// incomingOnly item is always taken -- there is no second version to weigh
// against, and discarding one source's unique content just because the
// other session didn't independently surface it would defeat the entire
// premise being tested (the workshop-merge analogy is explicitly about
// composing what different sessions each caught, not filtering by
// consensus). A suggested cross-label pairing (from suggestMatches()) is
// always accepted (choice "b") once proposed, since the proposer's own
// system prompt is already conservative about what it proposes. A matched
// item that differs between the two sources gets a fixed reasoning note
// (no plain pick -- see MATCHED_ITEM_NOTE below) so it routes to the real
// execution agent for actual reconciliation judgment, not a scripted
// keep/take coin flip. None of this is decided per-domain or after seeing
// a domain's own results; the same policy runs unchanged everywhere.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { launchChromium } from "../lib/browser.mjs";
import { APP_URL } from "../lib/page.mjs";
import { forwardToRealAzure, configureAzureEndpoint, openPanel } from "../lib/liveAzureOpenAi.mjs";
import { loadGroundTruthModel, resolveDomainYamlPath, listAvailableDomains } from "./lib/groundTruthModel.mjs";
import { computeHeuristicMatchPairs } from "./lib/recoveryMetrics.mjs";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { rescoreRun } from "./rescore-saved-run.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SOURCE_ROOT = path.resolve(__dirname, "..", "..", "ontology_translation", "results", "multi-domain");
const DEFAULT_OUT_ROOT = path.resolve(__dirname, "..", "..", "ontology_translation", "results", "cascading-merge");

const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const flag = (name) => process.argv.slice(2).includes(`--${name}`);

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

// Same deployment-vs-model-id pattern as run-multi-domain-benchmark.mjs's
// own connectAzure -- reused verbatim rather than imported, since it's a
// small unexported local function there too.
async function connectAzure(page, apiKey, endpoint, model) {
  const deploymentsUrl = `${endpoint.replace(/\/+$/, "")}/openai/deployments**`;
  forwardToRealAzure(page, deploymentsUrl);
  await openPanel(page);
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", apiKey);
  await configureAzureEndpoint(page, endpoint);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled, null, { timeout: 60000 });
  const picked = await page.evaluate((wanted) => {
    const select = document.getElementById("agent-model-select-modal");
    const option = [...select.options].find((o) => o.value === wanted);
    if (!option) return null;
    select.value = wanted;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return select.value;
  }, model);
  if (picked !== model) throw new Error(`deployment "${model}" not offered by the endpoint; got: ${picked}`);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true, null, { timeout: 60000 });
}

// Sent as the free-text reasoning on every matched-but-differing item, so
// it routes to the real execution agent (see importReviewItemNeedsAgent's
// own comment: any note routes to the agent, regardless of which plain
// pick -- or none -- accompanies it) with genuine reconciliation framing
// rather than a scripted keep/take.
const MATCHED_ITEM_NOTE =
  "These are two independently elicited descriptions of the same domain item, gathered in separate " +
  "interview sessions with the same expert (like two separate workshop notes on the same topic). " +
  "Reconcile them: keep whichever wording, aliases, or details are clearer or more complete, and " +
  "combine complementary details from both sides rather than discarding either outright, unless one " +
  "side is clearly wrong or redundant.";

const SHARED_NOTE =
  "This merge combines independently-run elicitation interviews of the same domain and persona, one " +
  "pair at a time -- analogous to synthesizing notes from separate workshop sessions with the same " +
  "expert, not reconciling two edits of one shared document. Preserve unique content each session " +
  "captured on its own; for items both sessions captured differently, reconcile rather than " +
  "arbitrarily discard. Be conservative about deletion, per your own role instructions above.";

// Drives one real Import Review pass -- the incoming YAML is merged into
// whatever the live canvas already holds -- and returns everything needed
// for the merged artifact and the report. Never touches page.state
// directly; every mutation goes through window.__kg.importReview.* the
// same way a human using the dialog would.
async function mergeIncoming(page, incomingYamlText, incomingLabel) {
  await page.evaluate(
    ({ text, filename }) => window.__kg.formats.openImportDialog(text, "yaml", filename),
    { text: incomingYamlText, filename: `${incomingLabel}.domain.yaml` }
  );
  await page.evaluate(() => window.__kg.importReview.open());

  await page.evaluate(() => window.__kg.importReview.suggestMatches());
  await page.waitForFunction(() => !window.__kg.importReview.isSuggestPending(), null, { timeout: 120000 });
  const suggestFailed = await page.evaluate(() => window.__kg.importReview.didSuggestFail());

  const decisionCounts = await page.evaluate(({ matchedNote }) => {
    const kg = window.__kg.importReview;
    const counts = { matchedNoted: 0, pairedAccepted: 0, currentKept: 0, incomingTaken: 0 };
    for (const item of kg.getItems()) {
      if (item.isPaired) {
        kg.setChoice(item.id, "b");
        counts.pairedAccepted++;
      } else if (item.section === "matched") {
        kg.setNote(item.id, matchedNote);
        counts.matchedNoted++;
      } else if (item.section === "currentOnly") {
        kg.setChoice(item.id, "a");
        counts.currentKept++;
      } else if (item.section === "incomingOnly") {
        kg.setChoice(item.id, "b");
        counts.incomingTaken++;
      }
    }
    return counts;
  }, { matchedNote: MATCHED_ITEM_NOTE });

  await page.evaluate((note) => window.__kg.importReview.setSharedNote(note), SHARED_NOTE);

  const allDecided = await page.evaluate(() => window.__kg.importReview.allDecided());
  if (!allDecided) throw new Error(`${incomingLabel}: not every import-review item was decided -- decision policy left a gap`);

  const decisionsMarkdown = await page.evaluate(() => window.__kg.importReview.decisionsMarkdown());

  await page.evaluate(() => window.__kg.importReview.apply());
  await page.waitForFunction(() => !window.__kg.importReview.isApplyPending(), null, { timeout: 15 * 60000 });

  const agentPreview = await page.evaluate(() => window.__kg.importReview.getAgentPreview());
  if (agentPreview) {
    await page.evaluate(() => window.__kg.importReview.confirmAgentPreview());
  }

  const lastResult = await page.evaluate(() => window.__kg.importReview.getLastResult());
  await page.evaluate(() => window.__kg.importReview.close());

  const mergedYaml = await page.evaluate(() => window.buildDomainYamlExport());
  return { mergedYaml, decisionsMarkdown, decisionCounts, suggestFailed, agentPreview, lastResult };
}

async function scoreAndWrite({ domain, stageId, mergedYaml, sourceDescription, decisionCounts, decisionsMarkdown, agentPreviewSummaries, lastResults, suggestFailures, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "recovered-model.yaml"), mergedYaml);
  fs.writeFileSync(path.join(outDir, "decisions.md"), decisionsMarkdown);

  const full = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath(domain) });
  const { state: recoveredState } = recoveredStateFromYaml(mergedYaml);
  fs.writeFileSync(path.join(outDir, "heuristic-matches.json"), `${JSON.stringify(computeHeuristicMatchPairs(full, recoveredState), null, 2)}\n`);

  const r = rescoreRun(outDir, domain);
  const metrics = {
    domain, runId: stageId, runUuid: crypto.randomUUID(),
    metrics: r.heuristic.full, scopedMetrics: r.heuristic.practical,
    // No live semantic (LLM-judge) pass for these merged artifacts --
    // deliberate scope decision, not an oversight: semantic judging asks
    // about a run's own specific near-misses (llmMatcher.mjs's own module
    // comment), which for a brand-new merged model would mean fresh judge
    // calls with their own real cost on top of the merge itself, for a
    // metric this repo's own summaries already treat as secondary to the
    // heuristic pass. Heuristic scoring is the same pass, same thresholds,
    // same code every other run in this repo is compared on.
    semanticMetrics: null, semanticScopedMetrics: null,
    ruleMetrics: r.rules.full, actionMetrics: r.actions.full,
    semanticRuleActionMetrics: null,
    operationalStats: {
      kind: "cascading-intelligent-merge", sourceDescription, decisionCounts, suggestFailures,
      agentPreviewSummaries, lastResults,
    },
  };
  fs.writeFileSync(path.join(outDir, "metrics.json"), `${JSON.stringify(metrics, null, 2)}\n`);
  return metrics;
}

function agentPreviewSummary(preview) {
  if (!preview) return null;
  return {
    agentTouchedCount: preview.agentTouched.length,
    agentCommentary: preview.agentCommentary,
    lineCount: preview.lines.length,
  };
}

async function main() {
  const domain = arg("domain");
  if (!domain) {
    console.error("Usage: node tests/evals/run-cascading-merge.mjs --domain=<id> [--force] [--sourceResultsDir=<path>] [--sourceRuns=run-01,run-02,run-03] [--outDir=<path>]");
    console.error(`Available domains: ${listAvailableDomains().join(", ")}`);
    process.exit(1);
  }
  const sourceResultsDir = path.resolve(process.cwd(), arg("sourceResultsDir", DEFAULT_SOURCE_ROOT));
  const sourceRuns = arg("sourceRuns", "run-01,run-02,run-03").split(",");
  if (sourceRuns.length !== 3) { console.error("Exactly 3 --sourceRuns= are required (run-01,run-02,run-03)."); process.exit(1); }
  const outRoot = path.resolve(process.cwd(), arg("outDir", DEFAULT_OUT_ROOT), domain);

  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const model = process.env.EVAL_INTERVIEWER_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!endpoint || !apiKey || !model) {
    console.error("AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT are required.");
    process.exit(1);
  }

  const sourceYamlPaths = sourceRuns.map((r) => path.join(sourceResultsDir, r, domain, "recovered-model.yaml"));
  for (const p of sourceYamlPaths) {
    if (!fs.existsSync(p)) { console.error(`missing source run: ${p}`); process.exit(1); }
  }
  const [yaml1, yaml2, yaml3] = sourceYamlPaths.map((p) => fs.readFileSync(p, "utf8"));

  const stage12Dir = path.join(outRoot, "merge-1-2");
  const stage123Dir = path.join(outRoot, "merge-1-2-3");
  if (!flag("force") && fs.existsSync(path.join(stage123Dir, "metrics.json"))) {
    console.log(`${domain}: cascading merge already complete -- skipping (pass --force to redo it)`);
    return;
  }

  const provenance = {
    schemaVersion: 1, domain, kind: "cascading-intelligent-merge",
    model, provider: "azure", endpointSha256: sha256(endpoint),
    sourceRuns, sourceResultsDir: path.relative(path.resolve(__dirname, "..", ".."), sourceResultsDir),
    sourceYamlSha256: sourceYamlPaths.map((p, i) => ({ run: sourceRuns[i], sha256: sha256(fs.readFileSync(p, "utf8")) })),
    domainYamlPath: `ontology_translation/domains/${domain}/reference.domain.yaml`,
    groundTruthSha256: sha256(fs.readFileSync(resolveDomainYamlPath(domain), "utf8")),
    matchedItemNoteSha256: sha256(MATCHED_ITEM_NOTE), sharedNoteSha256: sha256(SHARED_NOTE),
  };

  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  try {
    await page.goto(APP_URL);
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
    await page.evaluate(() => window.__kg.welcome.close());
    await connectAzure(page, apiKey, endpoint, model);
    provenance.interviewerPromptSha256 = sha256(await page.evaluate(() => window.buildAgentSystemPrompt()));

    // Seed the canvas with run-01's own saved model -- the exact mechanism
    // the app's own Replace-import uses, not a bespoke loader.
    await page.evaluate((text) => window.__kg.formats.commitYamlImport(text, "replace"), yaml1);

    console.log(`${domain}: merging ${sourceRuns[1]} into ${sourceRuns[0]}...`);
    const stage12 = await mergeIncoming(page, yaml2, sourceRuns[1]);
    if (stage12.suggestFailed) console.warn(`${domain}/merge-1-2: suggestMatches() failed -- proceeding without cross-label pairing for this stage`);
    const metrics12 = await scoreAndWrite({
      domain, stageId: "merge-1-2", mergedYaml: stage12.mergedYaml,
      sourceDescription: `${sourceRuns[0]} + ${sourceRuns[1]}`,
      decisionCounts: stage12.decisionCounts, decisionsMarkdown: stage12.decisionsMarkdown,
      agentPreviewSummaries: [agentPreviewSummary(stage12.agentPreview)], lastResults: [stage12.lastResult],
      suggestFailures: [stage12.suggestFailed], outDir: stage12Dir,
    });
    fs.writeFileSync(path.join(stage12Dir, "provenance.json"), `${JSON.stringify({ ...provenance, stage: "merge-1-2", generatedAt: new Date().toISOString(), mergedFrom: [sourceRuns[0], sourceRuns[1]] }, null, 2)}\n`);
    console.log(`${domain}/merge-1-2: recoveryEffectiveness (full) = ${metrics12.metrics.recoveryEffectiveness.toFixed(3)}`);

    console.log(`${domain}: merging ${sourceRuns[2]} into merge-1-2...`);
    const stage123 = await mergeIncoming(page, yaml3, sourceRuns[2]);
    if (stage123.suggestFailed) console.warn(`${domain}/merge-1-2-3: suggestMatches() failed -- proceeding without cross-label pairing for this stage`);
    const metrics123 = await scoreAndWrite({
      domain, stageId: "merge-1-2-3", mergedYaml: stage123.mergedYaml,
      sourceDescription: `(${sourceRuns[0]} + ${sourceRuns[1]}) + ${sourceRuns[2]}`,
      decisionCounts: stage123.decisionCounts, decisionsMarkdown: stage123.decisionsMarkdown,
      agentPreviewSummaries: [agentPreviewSummary(stage123.agentPreview)], lastResults: [stage123.lastResult],
      suggestFailures: [stage123.suggestFailed], outDir: stage123Dir,
    });
    fs.writeFileSync(path.join(stage123Dir, "provenance.json"), `${JSON.stringify({ ...provenance, stage: "merge-1-2-3", generatedAt: new Date().toISOString(), mergedFrom: [sourceRuns[0], sourceRuns[1], sourceRuns[2]] }, null, 2)}\n`);
    console.log(`${domain}/merge-1-2-3: recoveryEffectiveness (full) = ${metrics123.metrics.recoveryEffectiveness.toFixed(3)}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
