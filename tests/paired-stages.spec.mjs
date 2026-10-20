import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { withPage } from "./lib/page.mjs";
import { runOntologyRecoveryConversation } from "./evals/lib/conversationOrchestrator.mjs";
import { createStageController, parseLedger, STAGE_TEXTS } from "./evals/lib/pairedStages.mjs";
import { runCost, normalizeUsage } from "./evals/lib/runCost.mjs";
import { toolCallNamesOf } from "./evals/lib/reportGenerator.mjs";
import { scriptedInterviewer, asChatCompletion, lastFromChatBody } from "./lib/scriptedInterviewer.mjs";

// Issue #182's paired-stage harness, mocked end to end: the real app in a
// real page, its model calls answered by a script, the persona and the
// classifier answered by a stub. Checks the three snapshots land at the
// right turns, the sweep runs to its fixpoint, the naming pass renames
// through the rename tool, and the classifier survives a model that rejects
// temperature. No key, no network.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_URL = "https://api.openai.com/v1/models";
const CHAT_URL = "https://api.openai.com/v1/chat/completions";

// The interviewer, scripted by what it was last told (tests/lib/scriptedInterviewer.mjs).
function installScriptedRelay(page, interviewer) {
  const responses = [];
  page.route(CHAT_URL, (route) => {
    const request = route.request().postDataJSON();
    interviewer.requests.push(request);
    const body = asChatCompletion(interviewer.next(lastFromChatBody(request)));
    responses.push({ status: 200, url: CHAT_URL, body });
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return responses;
}

function newInterviewer() {
  return Object.assign(scriptedInterviewer(), { requests: [] });
}

// Persona and classifier. The classifier rejects temperature like
// gpt-6-sol does, and calls "finished" on "is complete".
function stubHarnessChat() {
  const calls = [];
  const chat = async (messages, model, extraBody = {}) => {
    const isClassifier = /You judge a single message/.test(messages[0].content);
    calls.push({ isClassifier, extraBody });
    if (!isClassifier) return { text: "Yes, that is right, and nothing more to add there.", usage: { prompt_tokens: 100, completion_tokens: 10 } };
    if ("temperature" in extraBody) throw new Error("HTTP 400: Unsupported value: 'temperature' does not support 0 with this model. Only the default (1) value is supported.");
    const judged = messages[1].content.split("MESSAGE TO JUDGE:\n").pop();
    return { text: JSON.stringify({ phase: "final wrap-up", finished: /is complete/.test(judged) }), usage: { prompt_tokens: 50, completion_tokens: 5 } };
  };
  return { chat, calls };
}

async function connect(page) {
  await page.route(MODELS_URL, (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1715000000, object: "model" }] }),
  }));
  if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
  await page.click("#agent-connect-open");
  await page.fill("#agent-key-input", "sk-test-key");
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
  await page.click("#agent-connect-submit");
  await page.waitForFunction(() => window.__kg.agent.state.connected === true);
}

function pageStageController(page, snapshots, options = {}) {
  const exportDoc = async () => yaml.load(await page.evaluate(() => window.buildDomainYamlExport())) || {};
  return createStageController({
    captureSnapshot: async (label, { turn }) => { const doc = await exportDoc(); snapshots.push({ label, turn, doc }); return doc; },
    readModel: exportDoc,
    renameLog: () => page.evaluate(() => window.__kg.agent.state.renameLog),
    ...options,
  });
}

test("one run yields snapshots A, B and C at the stage boundaries, the sweep reaches its fixpoint, and the naming pass renames in place", async () => {
  await withPage(async (page) => {
    await connect(page);
    const interviewer = newInterviewer();
    const harness = stubHarnessChat();
    const snapshots = [];
    const result = await runOntologyRecoveryConversation({
      page, apiKey: "unused", chat: harness.chat,
      installRelay: (p) => installScriptedRelay(p, interviewer),
      maxTurns: 30, wallClockMs: 5 * 60 * 1000, appTurnTimeoutMs: 20000,
      stageController: pageStageController(page, snapshots),
    });

    assert.equal(result.stoppedReason, "stages_complete");
    assert.deepEqual(snapshots.map((s) => [s.label, s.turn]), [["A", 2], ["B", 6], ["C", 8]]);
    assert.equal(result.turnsUsed, 8);

    const classesAt = (label) => Object.keys(snapshots.find((s) => s.label === label).doc.classes || {}).sort();
    assert.deepEqual(classesAt("A"), ["Invoice", "Supplier"], "A is the interviewer's own wrap-up");
    assert.deepEqual(classesAt("B"), ["Invoice", "Part", "Supplier"], "B adds what the sweep found");
    assert.deepEqual(classesAt("C"), ["Invoice", "Part", "Vendor"], "C has the expert's names");
    const c = snapshots.find((s) => s.label === "C").doc;
    assert.deepEqual(c.classes.Vendor.aliases, ["Supplier"]);
    assert.ok(c.classes.Invoice.properties.totalAmount && !c.classes.Invoice.properties.amount);
    assert.equal(c.relationships.length, 1);
    assert.equal(c.relationships[0].from, "Vendor");
    assert.equal(c.relationships[0].to, "Invoice");
    assert.deepEqual(c.relationships[0].aliases, ["connectsTo"]);

    // The stage instructions went to the interviewer, in order, and the
    // persona never saw them.
    assert.deepEqual(result.harnessMessages.map((m) => m.turn), [2, 4, 5, 6]);
    assert.equal(result.harnessMessages[0].text, STAGE_TEXTS.en.sweepFirst);
    assert.match(result.harnessMessages[1].text, /These classes were added in that pass: Part\./);
    assert.equal(result.harnessMessages[2].text, STAGE_TEXTS.en.sweepCloseout);
    assert.equal(result.harnessMessages[3].text, STAGE_TEXTS.en.naming);
    assert.ok(result.log.some((e) => e.speaker === "harness"));

    const s = result.stages;
    assert.equal(s.sweepRounds.length, 2);
    assert.deepEqual(s.sweepRounds.map((r) => [r.round, r.endedBy, r.classesAdded]), [[1, "ledger", ["Part"]], [2, "ledger", []]]);
    assert.deepEqual(s.sweepLedgerTotals, { surfaced: 2, added: 1, declined: 1, open: 0 });
    assert.deepEqual(s.namingRenames, { relationshipsRenamed: 1, relationshipsRedirected: 1, propertiesRenamed: 1, classesRenamed: 1, failed: 0 });
    assert.deepEqual(s.namingLedger, { relationships_renamed: 1, relationships_redirected: 1, properties_renamed: 1, classes_renamed: 1 });
    assert.deepEqual(s.stagesCapped, []);

    // The classifier dropped temperature once and kept working.
    assert.deepEqual(result.classifierParamsDropped, ["temperature"]);
    const classifierCalls = harness.calls.filter((x) => x.isClassifier);
    assert.ok(classifierCalls.slice(1).every((x) => !("temperature" in x.extraBody) && x.extraBody.response_format));
  });
});

test("without a stage controller the first wrap-up still ends the run, as before", async () => {
  await withPage(async (page) => {
    await connect(page);
    const interviewer = newInterviewer();
    const result = await runOntologyRecoveryConversation({
      page, apiKey: "unused", chat: stubHarnessChat().chat,
      installRelay: (p) => installScriptedRelay(p, interviewer),
      maxTurns: 30, wallClockMs: 5 * 60 * 1000, appTurnTimeoutMs: 20000,
    });
    assert.equal(result.stoppedReason, "app_agent_appears_finished");
    assert.equal(result.turnsUsed, 2);
    assert.equal(result.stages, null);
    assert.deepEqual(result.harnessMessages, []);
  });
});

test("shouldStop ends the run with its reason before the next turn starts", async () => {
  await withPage(async (page) => {
    await connect(page);
    const interviewer = newInterviewer();
    const result = await runOntologyRecoveryConversation({
      page, apiKey: "unused", chat: stubHarnessChat().chat,
      installRelay: (p) => installScriptedRelay(p, interviewer),
      maxTurns: 30, wallClockMs: 5 * 60 * 1000, appTurnTimeoutMs: 20000,
      stageController: pageStageController(page, []),
      shouldStop: async ({ turn }) => (turn >= 4 ? "cost_cap_reached" : null),
    });
    assert.equal(result.stoppedReason, "cost_cap_reached");
    assert.equal(result.turnsUsed, 3);
  });
});

// --- The controller on its own, no browser ---------------------------------

function fakeModel(initial) {
  let classes = [...initial];
  return {
    add: (...names) => { classes.push(...names); },
    doc: () => ({ classes: Object.fromEntries(classes.map((c) => [c, {}])) }),
  };
}

function controllerOver(model, options = {}) {
  const snaps = [];
  const ctl = createStageController({
    captureSnapshot: async (label, { turn }) => { snaps.push([label, turn]); return model.doc(); },
    readModel: async () => model.doc(),
    ...options,
  });
  return { ctl, snaps };
}

test("the sweep stops after sweepMaxRounds even if every round adds classes", async () => {
  const model = fakeModel(["A"]);
  const { ctl, snaps } = controllerOver(model, { sweepMaxRounds: 2, naming: false });
  assert.equal((await ctl.onInterviewerFinished({ turn: 10, appText: "done" })).message, STAGE_TEXTS.en.sweepFirst);
  model.add("B");
  assert.match((await ctl.onTurnWithoutFinish({ turn: 12, appText: "COVERAGE LEDGER: surfaced=1; added=1; declined=0; open=0" })).message, /added in that pass: B\./);
  model.add("C");
  assert.equal((await ctl.onTurnWithoutFinish({ turn: 14, appText: "COVERAGE LEDGER: surfaced=1; added=1; declined=0; open=0" })).message, STAGE_TEXTS.en.sweepCloseout,
    "round limit reached: no third round, straight to the close-out");
  assert.deepEqual(await ctl.onInterviewerFinished({ turn: 16, appText: "complete" }), { stop: true, stoppedReason: "stages_complete" });
  assert.deepEqual(snaps, [["A", 10], ["B", 16]]);
  assert.equal(ctl.summary().sweepRounds.length, 2);
});

test("a sweep that changes nothing skips the close-out and snapshots B at once", async () => {
  const model = fakeModel(["A"]);
  const { ctl, snaps } = controllerOver(model, { naming: false });
  await ctl.onInterviewerFinished({ turn: 5, appText: "done" });
  assert.deepEqual(await ctl.onTurnWithoutFinish({ turn: 9, appText: "COVERAGE LEDGER: surfaced=0; added=0; declined=0; open=0" }), { stop: true, stoppedReason: "stages_complete" });
  assert.deepEqual(snaps, [["A", 5], ["B", 9]]);
});

test("a stage's turn cap ends it, recorded as capped; ordinary turns return null", async () => {
  const model = fakeModel(["A"]);
  const { ctl, snaps } = controllerOver(model, { sweep: false, turnCaps: { naming: 3 } });
  assert.equal(await ctl.onTurnWithoutFinish({ turn: 50, appText: "a question?" }), null, "the interview itself has no stage cap");
  assert.equal((await ctl.onInterviewerFinished({ turn: 50, appText: "done" })).message, STAGE_TEXTS.en.naming);
  assert.equal(await ctl.onTurnWithoutFinish({ turn: 51, appText: "q?" }), null);
  assert.equal(await ctl.onTurnWithoutFinish({ turn: 52, appText: "q?" }), null);
  assert.deepEqual(await ctl.onTurnWithoutFinish({ turn: 53, appText: "q?" }), { stop: true, stoppedReason: "stages_complete" });
  assert.deepEqual(snaps, [["A", 50], ["C", 53]]);
  assert.deepEqual(ctl.summary().stagesCapped, ["naming"]);
});

test("a ledger line from the wrong stage does not end the current one", async () => {
  const model = fakeModel(["A"]);
  const { ctl } = controllerOver(model, { sweep: false });
  await ctl.onInterviewerFinished({ turn: 1, appText: "done" });
  assert.equal(await ctl.onTurnWithoutFinish({ turn: 2, appText: "COVERAGE LEDGER: surfaced=1; added=0; declined=0; open=1" }), null);
});

test("ledger lines parse to numbers, tolerate formatting, and fall back to text", () => {
  assert.deepEqual(parseLedger("coverage", "x\n**COVERAGE LEDGER: surfaced=12; added=3; declined=7; open=2**"),
    { surfaced: 12, added: 3, declined: 7, open: 2 });
  assert.deepEqual(parseLedger("naming", "NAMING LEDGER: relationships_renamed=4, relationships_redirected=1; properties_renamed=none; classes_renamed=0."),
    { relationships_renamed: 4, relationships_redirected: 1, properties_renamed: "none", classes_renamed: 0 });
  assert.equal(parseLedger("coverage", "no ledger here"), null);
});

// Same rule as tests/helper-agent-phase4.spec.mjs: instruction text carries
// no domain vocabulary, so it cannot hand the persona or the interviewer a
// hint. Its list, plus the two domains these stages run on.
const FORBIDDEN_DOMAIN_TERMS = [
  /resolver group/i, /on-call/i, /service desk/i, /compliance officer/i, /incident commander/i, /major incident/i, /\bincident\b/i,
  /\bregulator/i, /cybersecurity/i, /materiality/i, /emergency change/i, /deployment context/i, /configuration item/i,
  /\bloan/i, /\binterest\b/i, /borrower/i, /lender/i, /mortgage/i, /collateral/i, /amorti[sz]/i, /principal/i, /credit/i, /\bpayment/i,
  /\bhvac\b/i, /air handl/i, /boiler/i, /chiller/i, /valve/i, /damper/i, /\bfan\b/i, /sensor/i, /setpoint/i, /thermostat/i, /temperature/i, /\bzone\b/i,
  /hitel/i, /kamat/i, /kölcsön/i, /kazán/i, /szelep/i, /érzékelő/i, /hőmérséklet/i, /szellőz/i,
];

test("the stage texts carry no domain vocabulary, in either language", () => {
  for (const [lang, texts] of Object.entries(STAGE_TEXTS)) {
    const all = [texts.sweepFirst, texts.sweepNext(["X", "Y"]), texts.sweepCloseout, texts.naming].join("\n");
    for (const re of FORBIDDEN_DOMAIN_TERMS) assert.doesNotMatch(all, re, `${lang}: ${re}`);
  }
});

test("both languages ask for the same ledger lines", () => {
  for (const texts of Object.values(STAGE_TEXTS)) {
    assert.match(texts.sweepFirst, /^COVERAGE LEDGER: surfaced=<[^>]+>; added=<[^>]+>; declined=<[^>]+>; open=<[^>]+>$/m);
    assert.match(texts.naming, /^NAMING LEDGER: relationships_renamed=<[^>]+>; relationships_redirected=<[^>]+>; properties_renamed=<[^>]+>; classes_renamed=<[^>]+>$/m);
    assert.match(texts.naming, /rename_ontology_elements/);
  }
});

test("the design note quotes every stage text verbatim (pre-registration)", () => {
  const design = fs.readFileSync(path.join(__dirname, "..", "ontology_translation", "results", "paired-stages", "DESIGN.md"), "utf8");
  for (const [lang, texts] of Object.entries(STAGE_TEXTS)) {
    for (const [key, text] of Object.entries({ sweepFirst: texts.sweepFirst, sweepNext: texts.sweepNext(["{classes}"]), sweepCloseout: texts.sweepCloseout, naming: texts.naming })) {
      assert.ok(design.includes(text), `DESIGN.md is missing the ${lang} ${key} text verbatim`);
    }
  }
});

// --- Cost accounting --------------------------------------------------------

test("run cost counts both sides, both usage shapes, and prices cached input separately", () => {
  assert.deepEqual(normalizeUsage({ input_tokens: 10, output_tokens: 2, input_tokens_details: { cached_tokens: 4 }, output_tokens_details: { reasoning_tokens: 1 } }),
    { prompt: 10, completion: 2, cached: 4, reasoning: 1 });
  const cost = runCost({
    appUsageLog: [
      { kind: "interview", usage: { prompt_tokens: 1_000_000, completion_tokens: 100_000, prompt_tokens_details: { cached_tokens: 900_000 }, completion_tokens_details: { reasoning_tokens: 40_000 } } },
      { kind: "consistency_llm", usage: { prompt_tokens: 10_000, completion_tokens: 1_000 } },
    ],
    harnessUsages: [{ prompt_tokens: 200_000, completion_tokens: 20_000 }],
    prices: { input: 2, cachedInput: 0.2, output: 10 },
  });
  // app: 100k uncached*2 + 900k*0.2 + 100k*10 = 0.2 + 0.18 + 1.0; +10k*2 + 1k*10 = 0.02 + 0.01
  assert.equal(Number(cost.app.costUsd.toFixed(4)), 1.41);
  assert.equal(Number(cost.harness.costUsd.toFixed(4)), 0.6);
  assert.equal(Number(cost.all.costUsd.toFixed(4)), 2.01);
  assert.equal(cost.app.reasoningTokens, 40_000);
  assert.equal(Number(cost.app.cachedShare.toFixed(4)), Number((900_000 / 1_010_000).toFixed(4)));
  assert.deepEqual(Object.keys(cost.appByKind).sort(), ["consistency_llm", "interview"]);
});

test("tool calls are counted from either API's response shape", () => {
  assert.deepEqual(toolCallNamesOf({ choices: [{ message: { tool_calls: [{ function: { name: "apply_ontology_yaml" } }] } }] }), ["apply_ontology_yaml"]);
  assert.deepEqual(toolCallNamesOf({ output: [{ type: "reasoning" }, { type: "function_call", name: "get_graph_state" }, { type: "message" }] }), ["get_graph_state"]);
  assert.deepEqual(toolCallNamesOf(null), []);
});

test("the block driver's settings are the design note's, and it adds up money spent across finished and failed runs", async () => {
  const { protocolEnv, spentUsd } = await import("./evals/run-paired-stages.mjs");
  const design = fs.readFileSync(path.join(__dirname, "..", "ontology_translation", "results", "paired-stages", "DESIGN.md"), "utf8");
  const env = protocolEnv("high");
  assert.equal(env.EVAL_REASONING_EFFORT, "high");
  assert.equal(env.LLM_MODEL, "gpt-6-sol");
  assert.match(design, new RegExp(`Wall clock \\| ${env.ONTOLOGY_EVAL_WALLCLOCK_MINUTES} minutes`));
  assert.match(design, new RegExp(`Turn limit \\| ${env.ONTOLOGY_EVAL_MAX_TURNS}`));
  assert.match(design, new RegExp(`may take \\| ${env.ONTOLOGY_EVAL_APP_TURN_TIMEOUT_SEC} s`));
  assert.match(design, new RegExp(`Per-run cost cap \\| ${env.EVAL_RUN_COST_CAP_USD} USD`));
  assert.match(design, new RegExp(`at most ${env.ONTOLOGY_EVAL_SWEEP_MAX_ROUNDS}`));

  const root = fs.mkdtempSync(path.join((await import("node:os")).tmpdir(), "spent-"));
  try {
    const put = (rel, name, body) => { fs.mkdirSync(path.join(root, rel), { recursive: true }); fs.writeFileSync(path.join(root, rel, name), JSON.stringify(body)); };
    put("b1/run-01/fibo-loans", "provenance.json", { status: "complete", totalCostUsd: 9.5 });
    put("b1/run-01/brick-hvac", "provenance.json", { status: "in-progress" });
    put("b1/run-01/brick-hvac", "progress.json", { phase: "failed", costUsd: 2.25 });
    put("b1/run-01/brick-hvac/snapshots/A", "provenance.json", { totalCostUsd: 1000 });
    assert.equal(spentUsd(root), 11.75);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// --- Issue #188: a sign-off that names unfinished phases is not a finished interview ---

test("an incomplete sign-off is never 'finished': the classifier is not even asked", async () => {
  const { appearsFinished, looksLikeIncompleteSignOff } = await import("./evals/lib/conversationOrchestrator.mjs");
  // The real message that ended #182's block-2 brick-hvac run-03 in Phase 3.
  const cutShort = "Take care. The model remains **known-incomplete**: four accepted classes have no documented relationships, and properties, constraints, rules, the five actions, the domain-expansion pass, and final validation remain unfinished.";
  const earlier = "The decision-bearing properties, rules, and five actions have not yet been modeled, and final validation has not been run.";
  // Genuine wrap-ups list content gaps, never unfinished phases.
  const genuine = "Validation summary: every class has a meaning sentence; the expansion pass was made. Still thin: one trigger is structurally adjacent but not yet modeled as a true causation rule. The model is being left known-incomplete on these items: no verified assignment source.";
  assert.equal(looksLikeIncompleteSignOff(cutShort), true);
  assert.equal(looksLikeIncompleteSignOff(earlier), true);
  assert.equal(looksLikeIncompleteSignOff(genuine), false);
  let asked = 0;
  const chat = async () => { asked++; return { text: JSON.stringify({ phase: "final wrap-up", finished: true }) }; };
  assert.equal(await appearsFinished(cutShort, { chat }), false);
  assert.equal(asked, 0);
  assert.equal(await appearsFinished(genuine, { chat }), true, "a genuine wrap-up still goes to the classifier");
});

test("a run whose interviewer signs off with phases unfinished ends as interview_ended_incomplete, with no snapshot A", async () => {
  await withPage(async (page) => {
    await connect(page);
    let n = 0;
    const responses = [];
    page.route(CHAT_URL, (route) => {
      n++;
      const text = n === 1 ? "What does the agent need to answer first?"
        : n === 2 ? "Understood. We'll leave this as a known-incomplete first pass: properties, rules and actions have not yet been modeled, and final validation has not been run."
        : "Take care.";
      const body = asChatCompletion({ text });
      responses.push({ status: 200, body });
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
    });
    const harness = stubHarnessChat();
    const snapshots = [];
    const chat = async (messages, model, extraBody) => (/You judge a single message/.test(messages[0].content)
      ? harness.chat(messages, model, extraBody)
      : { text: "Take care.", usage: { prompt_tokens: 10, completion_tokens: 2 } });
    const result = await runOntologyRecoveryConversation({
      page, apiKey: "unused", chat, installRelay: () => responses,
      maxTurns: 20, wallClockMs: 5 * 60 * 1000, appTurnTimeoutMs: 20000,
      stageController: pageStageController(page, snapshots),
    });
    assert.equal(result.stoppedReason, "interview_ended_incomplete");
    assert.deepEqual(snapshots, [], "a cut-short interview is never taken as snapshot A");
  });
});
