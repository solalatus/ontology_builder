#!/usr/bin/env node
// Converts fixtures/itops_mtsr.yaml (the hand-authored MTSR-profile ground
// truth) into an equivalent ontology_translation/domains/itops/
// reference.domain.yaml, per issue #104's own explicit requirement: "so at
// least one benchmark exercises the new [.domain.yaml] path immediately."
//
// A re-runnable, mechanical script rather than a one-off hand-authored
// file (the user's own explicit decision) -- re-derivable if
// itops_mtsr.yaml is ever revised again, auditable by reading this file
// rather than trusting a byte-for-byte transcription of ~68 classes and
// 200+ predicates by eye. Run with:
//
//   node tests/evals/convert-itops-to-domain-yaml.mjs
//
// Writes ontology_translation/domains/itops/reference.domain.yaml and
// persona.md. persona.md is a NEW, shorter companion doc matching the
// other domains' own 4-section convention (Who they are / How they talk /
// What they know / What they don't volunteer) -- distilled from
// persona-eszter.md's own "Persona"/"Character" sections. It exists for
// folder-convention consistency (every domain under ontology_translation/
// domains/ has one); the live itops eval keeps using the original, richer,
// already-validated persona-eszter.md by default (ontology-recovery.eval.
// spec.mjs's EVAL_DOMAIN=itops path), not this file -- see that spec's own
// module comment for why.
//
// The original fixtures/itops_mtsr.yaml/persona-eszter.md are left
// completely untouched: kept for the offline regression check
// (test-itops-domain-yaml-parity.mjs) that this migration reproduces the
// same scores through the new loader, and as the itops live-eval's own
// unchanged default.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MTSR_PATH = path.resolve(__dirname, "fixtures", "itops_mtsr.yaml");
const OUT_DIR = path.resolve(__dirname, "..", "..", "ontology_translation", "domains", "itops");

const DATATYPE_TO_DOMAIN_YAML_TYPE = {
  boolean: "boolean", date: "date", timestamp: "date",
  percentage: "number", durationMinutes: "number", integer: "number", decimal: "number",
  text: "text",
};

function toPascalCase(id) {
  const cleaned = String(id).replace(/[^a-zA-Z0-9]+/g, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function toCamelCaseFromLabel(label) {
  const words = String(label).replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "value";
  return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join("");
}

function toPropertyName(label) {
  const stripped = String(label).replace(/^(has|is)\s+/i, "");
  return toCamelCaseFromLabel(stripped || label);
}

function convert(doc) {
  const classIdToName = {};
  for (const id of Object.keys(doc.classes || {})) classIdToName[id] = toPascalCase(id);

  const classes = {};
  for (const [id, c] of Object.entries(doc.classes || {})) {
    const name = classIdToName[id];
    const aliases = (c.aliases || []).filter((a) => a.toLowerCase() !== String(c.label || "").toLowerCase());
    classes[name] = { meaning: c.definition || c.label, ...(aliases.length ? { aliases } : {}), properties: {} };
  }

  const relationships = [];
  let droppedIdentifierUriCount = 0;
  for (const [, p] of Object.entries(doc.predicates || {})) {
    const fromName = classIdToName[p.from];
    if (!fromName) continue; // predicate targets a non-class (shouldn't happen, defensive)
    if (p.kind === "object") {
      const toName = classIdToName[p.to];
      if (!toName) continue;
      relationships.push({ name: toCamelCaseFromLabel(p.label), from: fromName, to: toName, meaning: p.definition || p.label, aliases: [] });
      continue;
    }
    // datatype/controlled-value -- nested onto the host class's properties.
    if (p.to === "identifier" || p.to === "uri") { droppedIdentifierUriCount++; continue; } // not agent-relevant, same exclusion isRecoverableProperty already applies at the scoring layer
    const propName = toPropertyName(p.label);
    if (p.kind === "controlled-value") {
      const valueSet = (doc.valueSets || {})[p.to];
      classes[fromName].properties[propName] = { type: "text", allowed: (valueSet ? valueSet.values : []).map(String) };
    } else {
      const type = DATATYPE_TO_DOMAIN_YAML_TYPE[p.to] || "text";
      classes[fromName].properties[propName] = { type };
    }
  }
  for (const c of Object.values(classes)) if (!Object.keys(c.properties).length) delete c.properties;

  const rules = {};
  const actions = {};
  for (const [id, a] of Object.entries(doc.actions || {})) {
    const actionName = id; // MTSR action ids are already valid camelCase identifiers (e.g. "acknowledgeAlert") -- toCamelCaseFromLabel is for space-separated labels, and would mangle an already-camelCase id by treating it as one unsplittable "word"
    const inputEntries = Object.entries(a.inputs || {});
    const primaryInputClassId = inputEntries[0] && inputEntries[0][1];
    const inputClassName = classIdToName[primaryInputClassId];
    if (!inputClassName) continue; // defensive
    const ruleName = `${actionName}Preconditions`;
    rules[ruleName] = { conditions: a.preconditions || [] };
    actions[actionName] = {
      input: inputClassName,
      preconditions: [ruleName],
      effect: (a.effects || []).join("; "),
      verification: (a.verification || []).join("; "),
    };
  }

  const competency_questions = (doc.competencyQuestions || []).map((text, i) => ({ id: `cq${i + 1}`, text }));

  return {
    domain: { classes, relationships, rules, actions, competency_questions },
    stats: { droppedIdentifierUriCount },
  };
}

function buildPersonaMd(doc) {
  const title = (doc.metadata && doc.metadata.title) || "IT Operations Expert";
  const scope = (doc.metadata && doc.metadata.scope) || "";
  return `# Persona: IT Operations & Incident Response Lead

Grounded in \`reference.domain.yaml\` (a mechanically converted equivalent
of this domain's original MTSR-profile ground truth,
\`tests/evals/fixtures/itops_mtsr.yaml\` -- see
\`tests/evals/convert-itops-to-domain-yaml.mjs\`). Written for an
elicitation interviewer to play against -- answers naturally from domain
work, never enumerates the hidden ontology.

Note: the live ontology-recovery eval's default itops run
(\`EVAL_DOMAIN=itops\`, the default) uses the original, richer
\`tests/evals/fixtures/persona-eszter.md\` instead of this file -- this
persona.md exists for folder-convention consistency with every other
domain under \`ontology_translation/domains/\`, not as the itops live
eval's own input.

## Who they are

You lead IT operations and major-incident management for a regulated
financial institution (${title}). Day-to-day scope: ${scope}
You think in terms of what services are affected, who is accountable,
what the current incident state actually is, and what evidence and
communications a real response requires.

## How you talk

Plainly, from operational experience -- incident, resolver group, on-call
engineer, not textbook ontology terms. You give concrete examples when
asked something abstract, and you distinguish closely related concepts
(incident vs. major incident, workaround vs. runbook) rather than
collapsing them.

## What you know and talk about naturally

You can speak to organizational roles and accountability, services and
their technical dependencies, monitoring and alerting, incident lifecycle
and classification, major-incident command, problem and corrective
action, change and release, recovery and continuity, evidence and
auditability, stakeholder communications, and materiality and regulatory
notification.

## What you don't volunteer

You don't recite the full data model unprompted, and you don't give legal
or statutory conclusions -- for those you'd involve Legal, Compliance, or
the designated regulatory-reporting function. If asked something outside
your operational remit, say so plainly rather than inventing an answer.
`;
}

function main() {
  const doc = yaml.load(fs.readFileSync(MTSR_PATH, "utf8"));
  const { domain, stats } = convert(doc);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "reference.domain.yaml"), yaml.dump(domain, { lineWidth: 100, sortKeys: false }), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "persona.md"), buildPersonaMd(doc), "utf8");

  console.log(`[convert-itops] classes=${Object.keys(domain.classes).length} relationships=${domain.relationships.length} ` +
    `rules=${Object.keys(domain.rules).length} actions=${Object.keys(domain.actions).length} ` +
    `cqs=${domain.competency_questions.length} droppedIdentifierUriProperties=${stats.droppedIdentifierUriCount}`);
  console.log(`[convert-itops] wrote ${path.join(OUT_DIR, "reference.domain.yaml")}`);
  console.log(`[convert-itops] wrote ${path.join(OUT_DIR, "persona.md")}`);
}

main();
