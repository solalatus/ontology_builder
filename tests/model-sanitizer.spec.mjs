import { test } from "node:test";
import assert from "node:assert/strict";
import { findModelIssues, sanitizeRecoveredModel, formatFindings } from "./evals/lib/modelSanitizer.mjs";

// Fast, deterministic unit tests for issue #140's content-quality checks.
// Each "real evidence" test below reproduces the exact shape of a defect the
// manual, page-by-page audit of all 15 real multi-domain benchmark runs
// found (see ontology_translation/TODO.md's dated entry and issue #140
// itself for the full evidence with file paths) -- trimmed to the minimum
// that reproduces it, not copy-pasted whole files.

function findingsOf(findings, kind, identity) {
  return findings.filter((f) => f.kind === kind && f.identity === identity);
}

// --- real evidence: unambiguous "strip" cases -------------------------------

test("brick-hvac/run-01: a relationship meaning of literal REMOVE is a strip finding", () => {
  const doc = {
    classes: { Zone: { meaning: "ok", aliases: [], properties: {} }, Thermostat: { meaning: "ok", aliases: [], properties: {} } },
    relationships: [{ name: "isServedBy", from: "Zone", to: "Thermostat", meaning: "REMOVE", aliases: [] }],
  };
  const findings = findModelIssues(doc);
  const hit = findingsOf(findings, "relationship", "isServedBy (Zone → Thermostat)");
  assert.equal(hit.length, 1);
  assert.equal(hit[0].severity, "strip");
  assert.equal(hit[0].pattern, "REMOVAL_SENTINEL");
});

test("REMOVE sentinel is case- and whitespace-insensitive but must be the whole value", () => {
  assert.equal(findModelIssues({ relationships: [{ name: "x", from: "A", to: "B", meaning: "  remove  " }] })[0].pattern, "REMOVAL_SENTINEL");
  // Not a sentinel: "remove" merely appears inside real prose describing an
  // actual domain concept (e.g. an asset-removal request) -- must not fire
  // on substring/word-boundary matches the way the advisory patterns do.
  const findings = findModelIssues({ relationships: [{ name: "x", from: "A", to: "B", meaning: "Governs when a device may be removed from service." }] });
  assert.equal(findings.length, 0);
});

test("iof-supply-chain/run-02: a class with meaning:null and an __REMOVE__ alias is a strip finding (class) plus a null-meaning advisory", () => {
  const doc = {
    classes: { Consignee: { meaning: null, aliases: ["__REMOVE__"], properties: {} } },
    relationships: [],
  };
  const findings = findModelIssues(doc);
  const strip = findings.filter((f) => f.severity === "strip" && f.kind === "class" && f.identity === "Consignee");
  assert.equal(strip.length, 1);
  assert.equal(strip[0].field, "aliases");
  const advisory = findings.filter((f) => f.severity === "advisory" && f.kind === "class" && f.identity === "Consignee");
  assert.equal(advisory.length, 1);
  assert.equal(advisory[0].pattern, "NULL_MEANING");
});

test("fibo-loans/run-02: a self-loop duplicating a properly-typed sibling relationship is a strip finding; a genuine self-loop with no sibling is not flagged", () => {
  const doc = {
    classes: {},
    relationships: [
      { name: "hasSubFacility", from: "CreditFacility", to: "SubFacility", meaning: "real", aliases: [] },
      { name: "hasSubFacility", from: "CreditFacility", to: "CreditFacility", meaning: "malformed self-loop", aliases: [] },
      { name: "reportsTo", from: "Employee", to: "Employee", meaning: "a genuine self-referential relationship", aliases: [] },
    ],
  };
  const findings = findModelIssues(doc);
  const selfLoopHit = findings.find((f) => f.pattern === "SELF_LOOP_DUPLICATE");
  assert.ok(selfLoopHit, "the CreditFacility self-loop must be flagged");
  assert.equal(selfLoopHit.severity, "strip");
  assert.equal(selfLoopHit.identity, "hasSubFacility (CreditFacility → CreditFacility)");
  const reportsToFlagged = findings.some((f) => f.identity === "reportsTo (Employee → Employee)");
  assert.equal(reportsToFlagged, false, "a self-loop with no same-named non-self-loop sibling must not be flagged");
});

// --- real evidence: advisory-only cases (never auto-stripped) --------------

test("brick-hvac/run-03: a class meaning that reads 'leftover... superseded' is advisory only, even though it is still load-bearing", () => {
  const doc = {
    classes: {
      TemperatureSetpoint: {
        meaning: "A leftover generic class now superseded by the more specific air, cooling, heating, and deadband setpoint types.",
        aliases: [], properties: {},
      },
      AirHandlingUnit: { meaning: "ok", aliases: [], properties: {} },
    },
    relationships: [{ name: "hasPoint", from: "AirHandlingUnit", to: "TemperatureSetpoint", meaning: "still wired in", aliases: [] }],
  };
  const findings = findModelIssues(doc);
  const hit = findingsOf(findings, "class", "TemperatureSetpoint");
  assert.equal(hit.length, 1);
  assert.equal(hit[0].severity, "advisory");
  assert.equal(hit[0].pattern, "SUPERSEDED");

  // strip:true must NOT delete this class or the real edge that still uses
  // it -- the audit's own point: this class is genuinely load-bearing.
  const { model, removed } = sanitizeRecoveredModel(doc, { strip: true });
  assert.ok("TemperatureSetpoint" in model.classes);
  assert.equal(model.relationships.length, 1);
  assert.equal(removed.classes.length, 0);
  assert.equal(removed.relationships.length, 0);
});

test("fibo-loans/run-03: a class meaning that reads 'Deprecated placeholder superseded by X' is advisory only", () => {
  const doc = {
    classes: { SupportAgreement: { meaning: "Deprecated placeholder superseded by CreditEnhancementAgreement.", aliases: ["replaced by CreditEnhancementAgreement"], properties: {} } },
    relationships: [],
  };
  const findings = findModelIssues(doc);
  const meaningHit = findings.find((f) => f.field === "meaning" && f.identity === "SupportAgreement");
  assert.equal(meaningHit.severity, "advisory");
  // Two independent advisory words in one sentence ("Deprecated" and
  // "superseded") must still collapse to exactly one meaning finding, not
  // fire twice.
  assert.equal(findings.filter((f) => f.field === "meaning").length, 1);
});

test("brick-hvac/run-03: feeds/fedBy and serves/servedBy reciprocal-pair duplicates are advisory only, never stripped", () => {
  const doc = {
    classes: {},
    relationships: [
      { name: "feeds", from: "AirHandlingUnit", to: "TerminalUnit", meaning: "a", aliases: [] },
      { name: "fedBy", from: "TerminalUnit", to: "AirHandlingUnit", meaning: "b", aliases: [] },
      { name: "serves", from: "Thermostat", to: "Zone", meaning: "c", aliases: [] },
      { name: "servedBy", from: "Zone", to: "Thermostat", meaning: "d", aliases: [] },
    ],
  };
  const findings = findModelIssues(doc);
  const pairs = findings.filter((f) => f.pattern === "RECIPROCAL_PAIR");
  assert.equal(pairs.length, 2);
  assert.ok(pairs.every((f) => f.severity === "advisory"));

  const { model, removed } = sanitizeRecoveredModel(doc, { strip: true });
  assert.equal(model.relationships.length, 4, "reciprocal-pair duplicates must survive strip mode untouched");
  assert.equal(removed.relationships.length, 0);
});

test("a 3-or-more-way group sharing a class pair is left alone (same caution as groundTruthModel.mjs's own reciprocal-pair merge)", () => {
  const doc = {
    classes: {},
    relationships: [
      { name: "qualifiedPersonFor", from: "MaintenanceActivity", to: "QualifiedMaintenancePerson", meaning: "a", aliases: [] },
      { name: "assignedTo", from: "MaintenanceActivity", to: "QualifiedMaintenancePerson", meaning: "b", aliases: [] },
      { name: "isQualifiedFor", from: "QualifiedMaintenancePerson", to: "MaintenanceActivity", meaning: "c", aliases: [] },
    ],
  };
  const findings = findModelIssues(doc);
  assert.equal(findings.filter((f) => f.pattern === "RECIPROCAL_PAIR").length, 0);
});

test("iof-maintenance/run-02: a relationship with meaning:null is advisory only (null meaning alone is never strippable)", () => {
  const doc = {
    classes: {},
    relationships: [{ name: "initiatesFailedState", from: "FailureEvent", to: "MaintenanceState", meaning: null, aliases: [] }],
  };
  const findings = findModelIssues(doc);
  const hit = findingsOf(findings, "relationship", "initiatesFailedState (FailureEvent → MaintenanceState)");
  assert.equal(hit.length, 1);
  assert.equal(hit[0].severity, "advisory");
  assert.equal(hit[0].pattern, "NULL_MEANING");
});

// --- true negatives: a genuinely clean model produces no findings ----------

test("a clean model with no defects produces zero findings", () => {
  const doc = {
    classes: {
      AirHandlingUnit: { meaning: "An assembly containing fans and other HVAC components.", aliases: ["AHU"], properties: { status: { type: "text" } } },
      Fan: { meaning: "A device with rotating blades used to produce airflow.", aliases: [], properties: {} },
    },
    relationships: [{ name: "hasPart", from: "AirHandlingUnit", to: "Fan", meaning: "An air handling unit is composed in part of a fan.", aliases: [] }],
  };
  assert.deepEqual(findModelIssues(doc), []);
  assert.equal(formatFindings([]), "No issues found.");
});

// --- sanitizeRecoveredModel: strip mode mechanics --------------------------

test("strip:false (default) returns an unmodified copy, not the same object, with full findings still computed", () => {
  const doc = { classes: { X: { meaning: "REMOVE", aliases: [], properties: {} } }, relationships: [] };
  const { model, findings, removed } = sanitizeRecoveredModel(doc);
  assert.notEqual(model, doc);
  assert.deepEqual(model, doc);
  assert.equal(findings.length, 1);
  assert.deepEqual(removed, { classes: [], relationships: [] });
});

test("strip:true cascades: removing a REMOVE-sentinel class also removes any relationship that references it", () => {
  const doc = {
    classes: {
      Good: { meaning: "fine", aliases: [], properties: {} },
      Bad: { meaning: "REMOVE", aliases: [], properties: {} },
    },
    relationships: [
      { name: "feeds", from: "Good", to: "Bad", meaning: "x", aliases: [] },
      { name: "feeds", from: "Bad", to: "Good", meaning: "y", aliases: [] },
      { name: "standalone", from: "Good", to: "Good", meaning: "z", aliases: [] },
    ],
  };
  const { model, removed } = sanitizeRecoveredModel(doc, { strip: true });
  assert.deepEqual(Object.keys(model.classes), ["Good"]);
  assert.equal(model.relationships.length, 1);
  assert.equal(model.relationships[0].name, "standalone");
  assert.equal(removed.classes.length, 1);
  assert.equal(removed.relationships.length, 2);
  assert.ok(removed.relationships.every((r) => r.reason === "CASCADE_REMOVED_CLASS"));
});

test("strip:true never mutates the input doc", () => {
  const doc = { classes: { X: { meaning: "REMOVE", aliases: [], properties: {} } }, relationships: [] };
  const before = JSON.stringify(doc);
  sanitizeRecoveredModel(doc, { strip: true });
  assert.equal(JSON.stringify(doc), before);
});

test("formatFindings renders both severities distinctly and separates strip from advisory", () => {
  const findings = [
    { severity: "strip", kind: "class", identity: "X", detail: "d1" },
    { severity: "advisory", kind: "class", identity: "Y", detail: "d2" },
  ];
  const text = formatFindings(findings);
  assert.match(text, /strippable/);
  assert.match(text, /advisory/);
  assert.match(text, /\[strip\]/);
  assert.match(text, /\[advisory\]/);
});
