import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// CONSISTENCY CHECKER (issue #83)
//
// Offline throughout: no API key, no network. The engine is a pure function
// over a domain-model document, so most of this drives it directly through
// window.__kg rather than through the UI -- which is also what lets the corpus
// test below run it over the three frozen anchor models.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "evals", "results", "runs");
const CORPUS = path.join(__dirname, "fixtures", "consistency-corpus", "labels.json");

const check = (page, model, options) =>
  page.evaluate(([m, o]) => window.__kg.consistency.compute(m, o), [model, options || {}]);
const checksOf = (findings) => findings.map((f) => f.check);

// A small, deliberately *finished-looking* model: enough relationships and
// actions that the gated checks are live, so a test asserting "nothing fires"
// means something.
const CLEAN = {
  classes: {
    Incident: { meaning: "An unplanned event.", aliases: ["ticket"], properties: { status: { type: "text", allowed: ["new", "closed"] } } },
    Engineer: { meaning: "A person.", properties: {} },
  },
  relationships: [{ name: "assignedTo", from: "Incident", to: "Engineer", meaning: "x" }],
  rules: { canClose: { conditions: ["Incident status is new."] } },
  actions: { closeIncident: { input: "Incident", preconditions: ["canClose"], effect: "Incident status becomes closed.", verification: "Read it back." } },
};

const clone = (o) => JSON.parse(JSON.stringify(o));

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

test("a coherent model produces no findings at all", async () => {
  await withPage(async (page) => {
    assert.deepEqual(await check(page, CLEAN), []);
  });
});

test("exact checks catch broken references", async () => {
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.relationships.push({ name: "reportedBy", from: "Incident", to: "Customer" });
    model.actions.escalate = { input: "Manager", preconditions: ["noSuchRule"], effect: "e", verification: "v" };
    const findings = await check(page, model);
    const errors = findings.filter((f) => f.severity === "error");
    assert.ok(checksOf(errors).includes("relationship-dropped"), "a relationship to an undeclared class must be reported");
    assert.ok(checksOf(errors).includes("action-input-missing"));
    assert.ok(checksOf(errors).includes("precondition-unknown-rule"));
    assert.ok(errors.every((f) => f.tier === "exact"));
  });
});

test("a relationship the import path skipped is reported even though the model cannot show it", async () => {
  // planYamlImport() drops these before they ever reach the model, so the only
  // way to surface one is for the caller to hand it over.
  await withPage(async (page) => {
    const findings = await check(page, CLEAN, { droppedReferences: [{ name: "causedBy", from: "Incident", to: "Ghost" }] });
    const dropped = findings.filter((f) => f.check === "relationship-dropped");
    assert.equal(dropped.length, 1);
    assert.equal(dropped[0].severity, "error");
    assert.match(dropped[0].message, /causedBy/);
  });
});

test("profile violations are warnings, not errors", async () => {
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.relationships.push({ name: "worksOn", from: "Engineer", to: "Incident" });
    model.relationships.push({ name: "isA", from: "Engineer", to: "Engineer" });
    const findings = await check(page, model);
    assert.ok(checksOf(findings).includes("inverse-pair"));
    assert.ok(checksOf(findings).includes("subclassing-predicate"));
    assert.ok(checksOf(findings).includes("self-loop"));
    assert.equal(findings.filter((f) => f.severity === "error").length, 0);
  });
});

test("incompleteness is never an error — a half-built model must not shout", async () => {
  // The single most important behaviour in the feature. Issue #84 hands these
  // findings to the interviewer mid-conversation; if "no relationships yet"
  // arrived as an error at Phase 2, the agent would chase it instead of
  // interviewing.
  await withPage(async (page) => {
    const young = {
      classes: { Incident: { properties: {} }, Engineer: { properties: {} }, Alert: { properties: {} } },
      relationships: [{ name: "assignedTo", from: "Incident", to: "Engineer" }],
      rules: { someRule: { conditions: ["Something holds."] } },
      actions: { doThing: { input: "Incident", preconditions: [], effect: "", verification: "" } },
    };
    const findings = await check(page, young);
    assert.equal(findings.filter((f) => f.severity === "error").length, 0);
    assert.equal(findings.filter((f) => f.severity === "warning").length, 0);
    const notes = checksOf(findings.filter((f) => f.severity === "note"));
    assert.ok(notes.includes("class-no-relationships"));
    assert.ok(notes.includes("orphan-rule"));
    assert.ok(notes.includes("action-missing-effect"));
  });
});

test("class-no-relationships is gated on the graph having started, and on the edit that created the class", async () => {
  await withPage(async (page) => {
    const empty = { classes: { A: {}, B: {} }, relationships: [], rules: {}, actions: {} };
    assert.equal(checksOf(await check(page, empty)).includes("class-no-relationships"), false,
      "an entirely unconnected graph is a new graph, not a broken one");

    const model = clone(CLEAN);
    model.classes.Alert = { properties: {} };
    assert.ok(checksOf(await check(page, model)).includes("class-no-relationships"));
    assert.equal(checksOf(await check(page, model, { createdNow: ["Alert"] })).includes("class-no-relationships"), false,
      "a class created by this very edit gets one sweep of grace");
  });
});

test("value-not-allowed catches a rule requiring a value its property forbids", async () => {
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.rules.canReopen = { conditions: ["Incident status is archived."] };
    model.actions.reopen = { input: "Incident", preconditions: ["canReopen"], effect: "e", verification: "v" };
    const hit = (await check(page, model)).find((f) => f.check === "value-not-allowed");
    assert.ok(hit, "expected the contradiction to be found");
    assert.equal(hit.severity, "error");
    assert.equal(hit.tier, "text");
    assert.match(hit.message, /"archived"/);
    assert.match(hit.suggestion, /Do not drop the condition/);
  });
});

test("value-not-allowed does not fire on the prose that surrounds a real value", async () => {
  // Each of these broke an earlier version of the check, and each one is a
  // shape that occurs in the anchor corpus.
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.rules.r1 = { conditions: ["Incident status is not new or closed."] };       // negated enumeration
    model.rules.r2 = { conditions: ["Incident status is present."] };                 // not a value at all
    model.rules.r3 = { conditions: ["Incident status is updated to the new value."] }; // verb + preposition
    model.classes.Report = { properties: { declarationStatus: { type: "text" } } };
    model.rules.r4 = { conditions: ["Report declarationStatus becomes complete."] };  // must not match `status`
    model.rules.r5 = { conditions: ["The Engineer resolves it, and status becomes archived."] }; // no adjacent class
    model.actions.a1 = { input: "Incident", preconditions: ["r1", "r2", "r3", "r4", "r5"], effect: "e", verification: "v" };
    const hits = (await check(page, model)).filter((f) => f.check === "value-not-allowed");
    assert.deepEqual(hits, [], `expected no value findings, got: ${hits.map((h) => h.message).join(" | ")}`);
  });
});

test("unreachable-from-action-input distinguishes wrong-direction from unconnected", async () => {
  await withPage(async (page) => {
    const model = {
      classes: { Incident: {}, Comms: {}, Vendor: {} },
      relationships: [{ name: "hasComms", from: "Incident", to: "Comms" }],
      rules: {
        needsIncident: { conditions: ["The Incident is severe."] },
        needsVendor: { conditions: ["The Vendor has been notified."] },
      },
      actions: { notify: { input: "Comms", preconditions: ["needsIncident", "needsVendor"], effect: "e", verification: "v" } },
    };
    const hits = (await check(page, model)).filter((f) => f.check === "unreachable-from-action-input");
    assert.equal(hits.length, 2);
    assert.match(hits.find((h) => h.message.includes("Incident")).message, /against the direction/);
    assert.match(hits.find((h) => h.message.includes("Vendor")).message, /not connected to it at all/);
    // The lesson from #75: rewording the rule is not a fix.
    assert.ok(hits.every((h) => /Rewording the text does not create the path/.test(h.suggestion)));
  });
});

test("unknown-property-reference fires on camelCase field names the model lacks, and not on prose", async () => {
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.actions.closeIncident.verification = "Confirm closedAt is present and the incident looks resolved.";
    const hits = (await check(page, model)).filter((f) => f.check === "unknown-property-reference");
    assert.equal(hits.length, 1);
    assert.match(hits[0].message, /closedAt/);
  });
});

test("effect-verification-mismatch catches a verification reading what the effect never writes", async () => {
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.classes.Incident.properties.closedAt = { type: "date" };
    model.actions.closeIncident.verification = "Confirm closedAt is present.";
    const hits = (await check(page, model)).filter((f) => f.check === "effect-verification-mismatch");
    assert.equal(hits.length, 1);
    assert.match(hits[0].message, /closedAt/);
  });
});

test("the engine is deterministic and tolerates malformed documents", async () => {
  await withPage(async (page) => {
    const a = await check(page, CLEAN);
    const b = await check(page, CLEAN);
    assert.deepEqual(a, b);
    for (const junk of [{}, { classes: "nope" }, { classes: { A: null }, relationships: "no" }, { classes: {}, rules: [] }]) {
      assert.ok(Array.isArray(await check(page, junk)));
    }
  });
});

test("finding ids are stable fingerprints, not positions", async () => {
  // Issue #84 compares findings between sweeps to decide what is new. That is
  // only meaningful if the same defect keeps the same id when something
  // unrelated changes elsewhere in the model.
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.rules.canReopen = { conditions: ["Incident status is archived."] };
    model.actions.reopen = { input: "Incident", preconditions: ["canReopen"], effect: "e", verification: "v" };
    const before = (await check(page, model)).find((f) => f.check === "value-not-allowed").id;
    model.classes.Unrelated = { properties: {} };
    model.relationships.push({ name: "touches", from: "Incident", to: "Unrelated" });
    const after = (await check(page, model)).find((f) => f.check === "value-not-allowed").id;
    assert.equal(after, before);
  });
});

test("findings come back worst-first", async () => {
  await withPage(async (page) => {
    const model = clone(CLEAN);
    model.classes.Lonely = { properties: {} };
    model.relationships.push({ name: "worksOn", from: "Engineer", to: "Incident" });
    model.rules.canReopen = { conditions: ["Incident status is archived."] };
    model.actions.reopen = { input: "Incident", preconditions: ["canReopen"], effect: "e", verification: "v" };
    const severities = (await check(page, model)).map((f) => f.severity);
    const rank = { error: 0, warning: 1, note: 2 };
    for (let i = 1; i < severities.length; i++) {
      assert.ok(rank[severities[i - 1]] <= rank[severities[i]], "findings must be ordered worst-first");
    }
  });
});

// ---------------------------------------------------------------------------
// The labelled corpus (issue #83 §8)
// ---------------------------------------------------------------------------

test("every documented defect labelled detectable is found in the anchor model it came from", async () => {
  const labels = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
  const detectable = labels.documented_defects.filter((d) => d.verdict === "detectable");
  assert.ok(detectable.length >= 3, "the corpus must still contain the defects this feature was built for");
  await withPage(async (page) => {
    const byRun = {};
    for (const run of ["run-01", "run-02", "run-03"]) {
      byRun[run] = await check(page, yaml.load(fs.readFileSync(path.join(RUNS_DIR, run, "recovered-model.yaml"), "utf8")));
    }
    for (const defect of detectable) {
      assert.ok(byRun[defect.run].some((f) => f.check === defect.check),
        `${defect.run} turn ${defect.turn}: expected a ${defect.check} finding for "${defect.defect}"`);
    }
    // The precision claim the corpus makes, pinned so it cannot quietly rot:
    // one error across three real models, and it is the documented one.
    const errors = Object.values(byRun).flat().filter((f) => f.severity === "error");
    assert.equal(errors.length, 1, `expected exactly one error across the three anchor models, got ${errors.length}`);
    assert.equal(errors[0].check, "value-not-allowed");
    assert.match(errors[0].message, /canSendRegulatoryNotification/);
  });
});

test("the corpus labels account for every documented defect", () => {
  const labels = JSON.parse(fs.readFileSync(CORPUS, "utf8"));
  assert.equal(labels.documented_defects.length, labels.totals.documented);
  for (const defect of labels.documented_defects) {
    assert.ok(["detectable", "process", "out-of-scope"].includes(defect.verdict));
    if (defect.verdict === "detectable") assert.ok(defect.check, "a detectable defect must name the check that finds it");
    else assert.ok(defect.reason, "anything not detectable must say why, in writing");
  }
  assert.ok(labels.unlabelled_findings.length > 0, "every finding outside the documented set needs an adjudication");
});

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

test("the badge stays quiet on a clean graph and counts only what is actionable", async () => {
  await withPage(async (page) => {
    const button = page.locator("#btn-consistency");
    assert.equal((await button.textContent()).trim(), "Check");
    assert.equal(await button.evaluate((el) => el.classList.contains("has-error")), false);

    // Two classes, no relationships -> notes only, which must not colour it.
    await addNodeViaDblClick(page, 200, 200, "Incident");
    await addNodeViaDblClick(page, 400, 200, "Engineer");
    assert.equal(await button.evaluate((el) => el.classList.contains("has-error") || el.classList.contains("has-warning")), false);
    assert.equal((await button.textContent()).trim(), "Check");
  });
});

test("the panel recomputes after a manual edit and after undo, and never becomes an edit itself", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      window.__kg.formats.openImportDialog("classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed:\n          - new\nrelationships: []\nrules:\n  canClose:\n    conditions:\n      - Incident status is archived.\nactions:\n  close:\n    input: Incident\n    preconditions:\n      - canClose\n    effect: e\n    verification: v\n", "yaml");
      document.getElementById("import-replace").click();
    });
    assert.equal(await page.locator("#btn-consistency").evaluate((el) => el.classList.contains("has-error")), true);

    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);
    await page.evaluate(() => window.__kg.consistency.open());
    assert.equal(await page.evaluate(() => window.__kg.consistency.isOpen()), true);
    assert.match(await page.locator("#consistency-list").textContent(), /archived/);
    await page.click("#consistency-close");
    assert.equal(await page.evaluate(() => window.__kg.history.past.length), historyBefore,
      "opening and closing the panel must never push history");

    await page.evaluate(() => window.__kg.actions.undo());
    assert.equal(await page.locator("#btn-consistency").evaluate((el) => el.classList.contains("has-error")), false);
  });
});

test("the panel retranslates live on a language toggle", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.consistency.open());
    assert.equal((await page.locator("#consistency-title").textContent()).trim(), "Consistency check");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.equal((await page.locator("#consistency-title").textContent()).trim(), "Konzisztencia-ellenőrzés");
  });
});

// ---------------------------------------------------------------------------
// Tier C -- the optional model pass
// ---------------------------------------------------------------------------

// Issue #89 switched this default from off to on. The evaluation behind that
// is in tests/evals/results/baselines/tier-c/TIER_C_REPORT.md; this test pins
// the resulting behavior in both directions, and the one below pins the
// property that makes "on by default" defensible at all -- that being enabled
// is not the same as being used.
test("the model pass is on by default, and the toggle turns it back off", async () => {
  await withPage(async (page) => {
    assert.equal(await page.evaluate(() => window.__kg.consistency.llm.isEnabled()), true);
    await page.evaluate(() => window.__kg.consistency.open());
    assert.equal(await page.locator("#consistency-llm-run").isVisible(), true);
    assert.equal(await page.locator("#consistency-llm-run").isDisabled(), true, "unusable without a connected agent");
    assert.equal(await page.locator("#consistency-llm-toggle").isChecked(), true, "the dialog's toggle must reflect the default");

    await page.evaluate(() => { window.__kg.consistency.llm.setEnabled(false); window.__kg.consistency.close(); window.__kg.consistency.open(); });
    assert.equal(await page.evaluate(() => window.__kg.consistency.llm.isEnabled()), false);
    assert.equal(await page.locator("#consistency-llm-run").isVisible(), false, "turning it off must hide the control again");
    assert.equal(await page.locator("#consistency-llm-toggle").isChecked(), false);
  });
});

test("turning it off persists across a reload — the default only applies to a profile that has never chosen", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.consistency.llm.setEnabled(false));
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    assert.equal(await page.evaluate(() => window.__kg.consistency.llm.isEnabled()), false,
      "an explicit off must survive; otherwise the default would silently re-enable it every visit");
    // ...and an explicit on is stored too, not just implied by the default.
    await page.evaluate(() => window.__kg.consistency.llm.setEnabled(true));
    assert.equal(await page.evaluate(() => localStorage.getItem(window.__kg.consistency.llm.storageKey)), "1");
  });
});

// The load-bearing claim of the default-on decision (issue #89's report §6):
// enabling the pass shows a button, it does not send anything. A default that
// made an outbound call on load would contradict the app's whole premise, so
// this asserts no request is made without a click.
test("being enabled by default sends nothing — no call happens until the user asks for one", async () => {
  await withPage(async (page) => {
    const requests = [];
    await page.route("**/v1/**", (route) => { requests.push(route.request().url()); route.abort(); });

    assert.equal(await page.evaluate(() => window.__kg.consistency.llm.isEnabled()), true);
    await page.evaluate(() => window.__kg.actions.createNode(0, 0, "Invoice"));
    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.close());
    await page.evaluate(() => window.__kg.consistency.open());

    assert.deepEqual(requests, [], "opening the panel with the pass enabled must not call anything");
    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.llm.results()), [],
      "and no model findings should exist without a run");
  });
});

test("a failed model check leaves the deterministic findings untouched", async () => {
  await withPage(async (page) => {
    await page.route("https://api.openai.com/v1/models", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
    }));
    await page.route("https://api.openai.com/v1/chat/completions", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ choices: [{ index: 0, message: { role: "assistant", content: "I could not do that." }, finish_reason: "stop" }] }),
    }));
    await page.evaluate(() => {
      window.__kg.formats.openImportDialog("classes:\n  Incident:\n    properties:\n      status:\n        type: text\n        allowed:\n          - new\nrelationships: []\nrules:\n  canClose:\n    conditions:\n      - Incident status is archived.\nactions:\n  close:\n    input: Incident\n    preconditions:\n      - canClose\n    effect: e\n    verification: v\n", "yaml");
      document.getElementById("import-replace").click();
    });
    const before = await page.evaluate(() => window.__kg.consistency.current().length);

    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.evaluate(() => window.__kg.consistency.llm.setEnabled(true));
    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await page.waitForFunction(() => document.getElementById("consistency-llm-status").textContent.length > 0);

    assert.deepEqual(await page.evaluate(() => window.__kg.consistency.llm.results()), [],
      "an unreadable reply must contribute nothing");
    assert.equal(await page.evaluate(() => window.__kg.consistency.current().length), before,
      "and must not disturb the deterministic findings");
    assert.match(await page.locator("#consistency-llm-status").textContent(), /could not be completed/);
  });
});

test("model observations are merged in, marked as the model's, and never outrank a deterministic error", async () => {
  await withPage(async (page) => {
    await page.route("https://api.openai.com/v1/models", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
    }));
    await page.route("https://api.openai.com/v1/chat/completions", (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ choices: [{ index: 0, message: { role: "assistant", content: '```json\n[{"severity":"error","subject":"canClose","message":"The rule and the action disagree."}]\n```' }, finish_reason: "stop" }] }),
    }));
    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.evaluate(() => window.__kg.consistency.llm.setEnabled(true));
    await page.evaluate(() => window.__kg.consistency.open());
    await page.evaluate(() => window.__kg.consistency.llm.run());
    await page.waitForFunction(() => window.__kg.consistency.llm.results().length > 0);

    const [finding] = await page.evaluate(() => window.__kg.consistency.llm.results());
    assert.equal(finding.tier, "llm");
    assert.equal(finding.severity, "warning", "a probabilistic observation must not be promoted to `error`");
    assert.match(await page.locator("#consistency-list").textContent(), /model/);
  });
});

test("a relationship the import silently dropped is surfaced after a real import", async () => {
  // End to end, through the app's own import path: the edge never reaches the
  // model, so the only way this can be reported is the plumbing added for it.
  await withPage(async (page) => {
    await page.evaluate(() => {
      window.__kg.formats.openImportDialog(
        "classes:\n  Incident:\n    properties: {}\nrelationships:\n  - name: causedBy\n    from: Incident\n    to: Ghost\nrules: {}\nactions: {}\n", "yaml");
      document.getElementById("import-replace").click();
    });
    const dropped = (await page.evaluate(() => window.__kg.consistency.current()))
      .filter((f) => f.check === "relationship-dropped");
    assert.equal(dropped.length, 1);
    assert.equal(dropped[0].severity, "error");
    assert.match(dropped[0].message, /causedBy/);
    assert.match(dropped[0].message, /Ghost/);
  });
});

// ---------------------------------------------------------------------------
// The silent-drop bug itself, fixed rather than merely reported
// ---------------------------------------------------------------------------

test("the import dialog warns about relationships it cannot store, before anything is committed", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.formats.openImportDialog(
      "classes:\n  Incident:\n    properties: {}\nrelationships:\n  - name: causedBy\n    from: Incident\n    to: Ghost\nrules: {}\nactions: {}\n", "yaml"));
    const summary = await page.locator("#import-summary").textContent();
    assert.match(summary, /cannot be stored/);
    assert.match(summary, /Incident --causedBy--> Ghost/);
    // Still just a warning: the import is not blocked, and the graph has not
    // changed yet either.
    assert.equal(await page.locator("#import-merge").isVisible(), true);
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 0);
  });
});

test("the agent is told when a relationship in its own call was not stored", async () => {
  // The bug this fixes: the reply used to be "Applied. Added 1, updated 0"
  // even when a relationship in that very call had been discarded, which is
  // how a model ends up sincerely reporting it recorded something it did not.
  const MODELS_URL = "https://api.openai.com/v1/models";
  const CHAT_URL = "https://api.openai.com/v1/chat/completions";
  await withPage(async (page) => {
    await page.route(MODELS_URL, (route) => route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ object: "list", data: [{ id: "gpt-4o-mini", created: 1, object: "model", owned_by: "openai" }] }),
    }));
    const bodies = [];
    let call = 0;
    await page.route(CHAT_URL, (route) => {
      bodies.push(route.request().postDataJSON());
      call += 1;
      const message = call === 1
        ? { role: "assistant", content: null, tool_calls: [{ id: "t1", type: "function", function: { name: "apply_ontology_yaml", arguments: JSON.stringify({ yaml: "classes:\n  Incident:\n    properties: {}\nrelationships:\n  - name: causedBy\n    from: Incident\n    to: Ghost\n" }) } }] }
        : { role: "assistant", content: "Understood." };
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ choices: [{ index: 0, message, finish_reason: call === 1 ? "tool_calls" : "stop" }] }) });
    });

    if (!(await page.evaluate(() => window.__kg.agent.isExpanded()))) await page.click("#agent-panel-toggle");
    await page.click("#agent-connect-open");
    await page.fill("#agent-key-input", "sk-test-key");
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => !document.getElementById("agent-model-select-modal").disabled);
    await page.click("#agent-connect-submit");
    await page.waitForFunction(() => window.__kg.agent.state.connected === true);

    await page.fill("#agent-chat-input", "Record that.");
    await page.click("#agent-chat-send");
    await page.waitForFunction(() => window.__kg.agent.isSending() === false);

    const toolResult = bodies[1].messages.find((m) => m.role === "tool").content;
    assert.match(toolResult, /Applied\. Added 1, updated 0/);
    assert.match(toolResult, /were NOT stored/);
    assert.match(toolResult, /Incident --causedBy--> Ghost/);
    // And the checker independently agrees the edge is gone.
    const dropped = (await page.evaluate(() => window.__kg.consistency.current())).filter((f) => f.check === "relationship-dropped");
    assert.equal(dropped.length, 1);
  });
});
