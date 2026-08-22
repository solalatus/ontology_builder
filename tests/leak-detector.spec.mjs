import { test } from "node:test";
import assert from "node:assert/strict";
import {
  collectRawIdentifiers,
  buildLeakCandidateSet,
  findLeakedIdentifiers,
} from "./evals/lib/leakDetector.mjs";

// A small synthetic domain doc, deliberately shaped like a real
// `.domain.yaml`, mixing multi-segment compounds (real leak risk) with
// single-segment identifiers matching the audit's own measured
// false-positive list (status, cost, Supplier, Shipment, ...).
const domainDoc = {
  classes: {
    AirHandlingUnit: {
      aliases: ["AHU"],
      properties: { status: { type: "text" }, hasBorrower: { type: "text" } },
    },
    Supplier: { properties: { cost: { type: "number" } } },
    Shipment: { properties: {} },
  },
  relationships: [
    { name: "servesZone", from: "AirHandlingUnit", to: "Supplier", aliases: ["serves"] },
    { name: "uses", from: "Supplier", to: "Shipment" },
  ],
  rules: { requiresApprovalAboveThreshold: { conditions: ["cost exceeds policy limit"] } },
  actions: { approveShipment: { input: "Shipment" } },
};

test("collectRawIdentifiers walks classes, properties, relationships, rules, and actions", () => {
  const ids = collectRawIdentifiers(domainDoc);
  assert.equal(ids.has("AirHandlingUnit"), true);
  assert.equal(ids.has("hasBorrower"), true);
  assert.equal(ids.has("servesZone"), true);
  assert.equal(ids.has("requiresApprovalAboveThreshold"), true);
  assert.equal(ids.has("approveShipment"), true);
  assert.equal(ids.has("status"), true, "single-segment identifiers are still collected -- filtering happens later");
});

// Issue #133/N3 (independent audit of this same fix): relationship aliases
// were never walked here -- a real leaked alias (iof-maintenance's
// "prescribedBy") could reach the persona's context and never be flagged by
// this exact function, since it was never in the candidate set at all.
test("collectRawIdentifiers walks a relationship's own aliases, not just its primary name", () => {
  const docWithAliasedRelationship = {
    classes: { MaintenanceProcess: {}, MaintenanceStrategy: {} },
    relationships: [
      { name: "isCarriedOutUnder", from: "MaintenanceProcess", to: "MaintenanceStrategy", aliases: ["prescribedBy"] },
    ],
  };
  const ids = collectRawIdentifiers(docWithAliasedRelationship);
  assert.equal(ids.has("isCarriedOutUnder"), true);
  assert.equal(ids.has("prescribedBy"), true, "the alias must be collected too, not just the relationship's own name");
});

test("buildLeakCandidateSet excludes every single-segment identifier from the audit's own measured false-positive list", () => {
  const candidates = buildLeakCandidateSet(domainDoc, "");
  for (const word of ["status", "cost", "Supplier", "Shipment", "uses"]) {
    assert.equal(candidates.has(word), false, `"${word}" is single-segment and must never be flagged`);
  }
  assert.equal(candidates.has("AirHandlingUnit"), true, "multi-segment PascalCase compound IS a real leak candidate");
  assert.equal(candidates.has("hasBorrower"), true, "multi-segment camelCase compound IS a real leak candidate");
  assert.equal(candidates.has("servesZone"), true);
  assert.equal(candidates.has("requiresApprovalAboveThreshold"), true);
  assert.equal(candidates.has("approveShipment"), true);
});

test("buildLeakCandidateSet excludes an identifier already present, verbatim, in the persona's own brief", () => {
  const brief = "You work closely with the AirHandlingUnit fleet every day.";
  const candidates = buildLeakCandidateSet(domainDoc, brief);
  assert.equal(candidates.has("AirHandlingUnit"), false, "already legitimately given to the persona -- not a hidden internal key");
  assert.equal(candidates.has("hasBorrower"), true, "brief mentioning one identifier does not exempt unrelated ones");
});

test("findLeakedIdentifiers catches a real verbatim leak of a raw compound identifier", () => {
  const candidates = buildLeakCandidateSet(domainDoc, "");
  const leaked = findLeakedIdentifiers("Sure -- an AirHandlingUnit is what we call the rooftop package unit.", candidates);
  assert.deepEqual(leaked, ["AirHandlingUnit"]);
});

test("findLeakedIdentifiers does not flag the natural-language phrasing of the same concept", () => {
  const candidates = buildLeakCandidateSet(domainDoc, "");
  const leaked = findLeakedIdentifiers("Sure -- an air handling unit is what we call the rooftop package unit.", candidates);
  assert.deepEqual(leaked, [], "natural-language labels are exactly what the interview is supposed to elicit, not a leak");
});

test("findLeakedIdentifiers does not flag a candidate identifier appearing only as a substring of an unrelated longer word", () => {
  const candidates = new Set(["uses"]); // deliberately force a single-segment id through, to test word-boundary safety alone
  const leaked = findLeakedIdentifiers("The device confuses operators when it fails silently.", candidates);
  assert.deepEqual(leaked, [], "\"uses\" must not match inside \"confuses\"");
});

test("findLeakedIdentifiers catches multiple distinct leaked identifiers in one reply", () => {
  const candidates = buildLeakCandidateSet(domainDoc, "");
  const leaked = findLeakedIdentifiers(
    "The approveShipment action requires servesZone to be satisfied first.",
    candidates,
  );
  assert.deepEqual(new Set(leaked), new Set(["approveShipment", "servesZone"]));
});

test("findLeakedIdentifiers is silent on ordinary domain prose that never mentions any raw identifier", () => {
  const candidates = buildLeakCandidateSet(domainDoc, "");
  const leaked = findLeakedIdentifiers(
    "We track status and cost for every supplier shipment, and approvals above the policy limit need sign-off.",
    candidates,
  );
  assert.deepEqual(leaked, []);
});
