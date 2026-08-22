import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import yaml from "js-yaml";
import { renderNaturalLanguageBriefing } from "./evals/lib/groundTruthBriefing.mjs";
import { collectRawIdentifiers } from "./evals/lib/leakDetector.mjs";
import { resolveDomainYamlPath, listAvailableDomains } from "./evals/lib/groundTruthModel.mjs";

const domainDoc = {
  classes: {
    AirHandlingUnit: {
      meaning: "An assembly that circulates and conditions air.",
      aliases: ["AHU"],
      properties: { hasSetpoint: { type: "number" } },
    },
    Fan: { meaning: "A device that moves air.", properties: {} },
  },
  relationships: [
    { name: "hasPart", from: "AirHandlingUnit", to: "Fan", meaning: "An AHU is composed in part of a fan." },
  ],
  rules: { requiresApprovalAboveThreshold: { conditions: ["cost exceeds the approved policy limit"] } },
  actions: { approveShipment: { input: "Fan", effect: "The shipment is marked approved." } },
};

test("renderNaturalLanguageBriefing replaces every raw multi-segment identifier (keys and value references) with its natural-language form", () => {
  const rendered = renderNaturalLanguageBriefing(yaml.dump(domainDoc));
  for (const raw of ["AirHandlingUnit", "hasSetpoint", "hasPart", "requiresApprovalAboveThreshold", "approveShipment"]) {
    assert.equal(rendered.includes(raw), false, `raw identifier "${raw}" must not survive rendering`);
  }
  assert.match(rendered, /Air Handling Unit/);
  assert.match(rendered, /has Setpoint/);
  assert.match(rendered, /has Part/);
});

test("renderNaturalLanguageBriefing preserves all descriptive prose content unchanged", () => {
  const rendered = renderNaturalLanguageBriefing(yaml.dump(domainDoc));
  assert.match(rendered, /An assembly that circulates and conditions air\./);
  assert.match(rendered, /cost exceeds the approved policy limit/);
  assert.match(rendered, /The shipment is marked approved\./);
  assert.match(rendered, /AHU/, "aliases (already natural language) survive untouched");
});

test("renderNaturalLanguageBriefing round-trips back to a parseable YAML document with the same shape", () => {
  const rendered = renderNaturalLanguageBriefing(yaml.dump(domainDoc));
  const reparsed = yaml.load(rendered);
  assert.equal(Object.keys(reparsed.classes).length, 2);
  assert.equal(reparsed.relationships.length, 1);
  assert.equal(reparsed.relationships[0].from, "Air Handling Unit");
});

// Issue #133/N7a (independent audit of this same fix): this used to assert
// the opposite (degrades to returning the raw text unchanged, never
// throws) -- that was itself the bug: a fail-open path that silently
// handed the persona's context the raw, un-rendered, leak-exposing text on
// any parse failure. A briefing that can't be rendered must fail loudly.
test("renderNaturalLanguageBriefing throws on unparseable YAML, rather than silently falling back to the raw (leak-exposing) text", () => {
  const input = "not: valid: yaml: [unterminated";
  assert.throws(() => renderNaturalLanguageBriefing(input), /failed to parse/);
});

test("renderNaturalLanguageBriefing relabels a raw identifier embedded inline inside an otherwise-prose sentence, not just an isolated key/value", () => {
  const docWithInlineIdentifier = {
    classes: { Loan: {}, Borrower: {} },
    relationships: [{ name: "hasBorrower", from: "Loan", to: "Borrower" }],
    rules: { requiresBorrowerOnFile: { conditions: ["loan hasBorrower Borrower"] } },
  };
  const rendered = renderNaturalLanguageBriefing(yaml.dump(docWithInlineIdentifier));
  assert.equal(rendered.includes("hasBorrower"), false, "the raw token must not survive even when embedded mid-sentence");
  assert.match(rendered, /loan has Borrower Borrower/);
});

// Issue #133/N3 (independent audit of this same fix): a relationship's own
// `aliases:` were never walked by collectRawIdentifiers, so the "every real
// domain renders with zero surviving raw identifiers" test below couldn't
// have caught a leaked alias -- it derives its own expected-identifier list
// from the very same (buggy) function the renderer itself was built on, so
// the blind spot was shared between the code and the test that was
// supposed to catch it. Pinned directly here as its own real-incident
// regression, independent of collectRawIdentifiers's own output: the real
// "prescribedBy" alias (iof-maintenance) actually leaked into the rendered
// briefing before this fix.
test("a relationship's own alias (not just its primary name) is relabeled -- real incident: iof-maintenance's \"prescribedBy\" leaked before this fix", () => {
  const domainYamlPath = resolveDomainYamlPath("iof-maintenance");
  const rawText = fs.readFileSync(domainYamlPath, "utf8");
  const doc = yaml.load(rawText);
  const relWithAlias = doc.relationships.find((r) => (r.aliases || []).includes("prescribedBy"));
  assert.ok(relWithAlias, "expected iof-maintenance's reference.domain.yaml to still declare this alias -- test fixture assumption");
  const rendered = renderNaturalLanguageBriefing(rawText);
  assert.equal(rendered.includes("prescribedBy"), false, "the aliased raw identifier must not survive rendering");
});

test("every real domain's reference.domain.yaml renders with zero surviving multi-segment raw identifiers", () => {
  for (const domainId of listAvailableDomains()) {
    const domainYamlPath = resolveDomainYamlPath(domainId);
    const rawText = fs.readFileSync(domainYamlPath, "utf8");
    const doc = yaml.load(rawText);
    if (!doc || !doc.classes) continue; // itops's own MTSR-shaped fixture, out of scope for this renderer
    const rendered = renderNaturalLanguageBriefing(rawText);
    const rawIds = collectRawIdentifiers(doc);
    const survivors = [...rawIds].filter((id) => {
      const segments = id.replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim().split(/\s+/);
      if (segments.length < 2) return false; // single-segment words are expected to still appear -- that's fine
      return new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(rendered);
    });
    assert.deepEqual(survivors, [], `domain "${domainId}" leaked raw identifiers into its rendered briefing: ${survivors.join(", ")}`);
  }
});
