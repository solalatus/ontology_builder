import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSystemPrompt, deriveOpeningLine, OPENING_LINE } from "./evals/lib/personaAgent.mjs";
import { listAvailableDomains, resolveDomainPersonaPath, resolveDomainYamlPath } from "./evals/lib/groundTruthModel.mjs";

// Offline, deterministic tests for personaAgent.mjs's issue #104
// generalization: the domain-agnostic experiment scaffolding that used to
// live entirely inside persona-eszter.md was extracted into
// persona-experiment-wrapper.md so any domain's own persona.md can share
// it. These tests are the "regression-tested against itops to confirm no
// behavior change" check that decision called for -- not a byte-identical
// snapshot (the section ORDER changed: wrapper-Purpose, persona content,
// then the rest of the wrapper, rather than the original file's own
// interleaving), but a content-completeness check: every substantive rule
// the original persona-eszter.md carried must still be present somewhere
// in the newly-assembled prompt, worded the same or genericized
// equivalently. No live API calls, no key required.

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("buildSystemPrompt() (itops default) still contains every substantive rule from the original persona-eszter.md's now-shared sections", () => {
  const prompt = buildSystemPrompt();

  // Hidden-ground-truth rule's 7 numbered items (genericized wording, same
  // substance) -- spot-check a distinctive phrase from several of them.
  assert.match(prompt, /Use natural language labels and aliases, not internal/);
  assert.match(prompt, /Distinguish descriptive knowledge from enforcement/);
  assert.match(prompt, /Never reveal that the reference model contains a fixed number/);

  // How to answer different interview question types -- every subsection
  // heading survived, plus the relationship-questions "own vocabulary" rule
  // (a real, specific instruction, not boilerplate).
  for (const heading of [
    "Concept questions", "Relationship questions", "Property or field questions",
    "Controlled-value questions", "Constraint questions", "Action questions",
    "Scenario questions", 'Requests for "everything"',
  ]) {
    assert.match(prompt, new RegExp(`### ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }
  assert.match(prompt, /A real domain expert has their own settled vocabulary/);

  // Interview behaviour for ontology-recovery experiments.
  assert.match(prompt, /Cooperate fully with systematic elicitation/);
  assert.match(prompt, /do not volunteer the entire model in the first answer/);

  // Consistency checklist -- genericized item 1, same intent.
  assert.match(prompt, /Am I speaking in character as the persona described above/);

  // Ending the interview. Issue #133/E12 (external audit): the original
  // fixed worked example ("That covers it well, thank you.") was itself the
  // literal string that repeated 159 times in a real dead-loop incident
  // (iof-maintenance/run-03) -- the wrapper now deliberately avoids handing
  // the persona one fixed template to echo verbatim, so this checks for the
  // preserved BEHAVIOR (a single short closing line, own words, then stop)
  // rather than that specific retired phrase.
  assert.match(prompt, /give a single short closing line in your own words/);
  assert.match(prompt, /do not repeat a farewell or thank-you back and forth turn after turn/);

  // itops-specific content (never touched by the wrapper extraction) is
  // still present too -- the trimmed persona-eszter.md's own remainder.
  assert.match(prompt, /Eszter Farkas/);
  assert.match(prompt, /Pannon Commercial Bank/);
  assert.match(prompt, /szolgáltatásgazda/);

  // The embedded ground truth (default: the MTSR fixture) is present.
  assert.match(prompt, /hungarian_bank_itops_incident_response_mtsr\.yaml/);
  assert.match(prompt, /```yaml/);
});

test("buildSystemPrompt() with an explicit domain persona/ground truth embeds that domain's own content, not itops's", () => {
  const personaPath = resolveDomainPersonaPath("brick-hvac");
  assert.ok(personaPath, "brick-hvac must have a persona.md");
  const groundTruthText = fs.readFileSync(resolveDomainYamlPath("brick-hvac"), "utf8");

  const prompt = buildSystemPrompt({ personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml" });

  assert.match(prompt, /Maintenance & Reliability Lead|Air Handling Unit/i);
  assert.doesNotMatch(prompt, /Eszter Farkas/);
  assert.doesNotMatch(prompt, /Pannon Commercial Bank/);
  // Wrapper scaffolding is still present regardless of which domain.
  assert.match(prompt, /Never reveal that the reference model contains a fixed number/);
  assert.match(prompt, /reference\.domain\.yaml/);
});

test("buildSystemPrompt() with groundTruthFormat: \"domain-yaml\" embeds the natural-language rendering, not the raw identifier text (issue #133/E12 item 1)", () => {
  const personaPath = resolveDomainPersonaPath("brick-hvac");
  const groundTruthText = fs.readFileSync(resolveDomainYamlPath("brick-hvac"), "utf8");

  const prompt = buildSystemPrompt({
    personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml", groundTruthFormat: "domain-yaml",
  });

  assert.equal(prompt.includes("AirHandlingUnit"), false, "the raw internal identifier must never reach the persona's own context");
  assert.match(prompt, /Air Handling Unit/, "the natural-language label is present instead");
  // The domain's real descriptive content (aliases, prose) still survives.
  assert.match(prompt, /AHU/);
});

test("buildSystemPrompt() without groundTruthFormat (default) still embeds the raw domain-yaml identifiers unchanged -- backward compatible for every existing caller", () => {
  const personaPath = resolveDomainPersonaPath("brick-hvac");
  const groundTruthText = fs.readFileSync(resolveDomainYamlPath("brick-hvac"), "utf8");

  const prompt = buildSystemPrompt({ personaPath, groundTruthText, groundTruthFilename: "reference.domain.yaml" });

  assert.match(prompt, /AirHandlingUnit/, "raw identifier text embedded as before when groundTruthFormat is not passed");
});

test("deriveOpeningLine turns a persona.md's own \"Who they are\" section into a first-person opener", () => {
  const personaPath = resolveDomainPersonaPath("brick-hvac");
  const text = fs.readFileSync(personaPath, "utf8");
  const opening = deriveOpeningLine(text);

  assert.match(opening, /^I\b/, `expected a first-person opener, got: ${opening}`);
  assert.match(opening, /Where would you like to start\?$/);
  // The fixed generic tail ("Where would you like to start?") legitimately
  // addresses the interviewer in second person -- only the persona's own
  // self-description (everything before it) must have been converted.
  const selfDescription = opening.replace(/\s*Where would you like to start\?$/, "");
  assert.doesNotMatch(selfDescription, /\byou\b|\byour\b/i, "should not still address the model in second person");
});

// Issue #133/E21 (external audit): the bare pronoun swap alone turned "You
// are" into the ungrammatical "I are", and "You were" into "I were" --
// harmless against the four real personas that exist today (none of them
// happen to phrase their "Who they are" section this way), but a future
// persona could trigger it and open the interview with a visibly broken
// sentence.
test("deriveOpeningLine conjugates \"You are\"/\"You were\" correctly instead of leaving the ungrammatical \"I are\"/\"I were\"", () => {
  const text = "## Who they are\nYou are a senior logistics coordinator. You were previously a warehouse manager.\n";
  const opening = deriveOpeningLine(text);
  assert.match(opening, /^I am a senior logistics coordinator\.\s+I was previously a warehouse manager\./);
  assert.doesNotMatch(opening, /\bI are\b|\bI were\b/i);
});

// E21's own suggested mitigation: pin the four current domains' real derived
// openers so any future change to deriveOpeningLine (or to a persona.md's
// "Who they are" wording) that breaks the grammar is caught immediately,
// not just "parses without throwing".
test("deriveOpeningLine produces a real, non-empty, first-person opener for every domain that exists today", () => {
  const domains = listAvailableDomains();
  assert.ok(domains.length >= 4, "expected at least the 4 domains translated so far");
  for (const domainId of domains) {
    const personaPath = resolveDomainPersonaPath(domainId);
    if (!personaPath) continue; // itops-style domains without a persona.md, if any
    const opening = deriveOpeningLine(fs.readFileSync(personaPath, "utf8"));
    assert.ok(opening.length > 20, `${domainId}: opening line too short: "${opening}"`);
    assert.match(opening, /^I\b/, `${domainId}: expected a first-person opener, got: "${opening}"`);
  }
});

test("itops's own OPENING_LINE constant is unchanged -- issue #104 explicitly kept it hand-authored, not mechanically derived", () => {
  assert.match(OPENING_LINE, /I lead IT operations governance and major-incident management/);
});

test("persona-experiment-wrapper.md's {{GROUND_TRUTH_FILENAME}} placeholder is substituted, not leaked verbatim", () => {
  const prompt = buildSystemPrompt({ groundTruthFilename: "example.domain.yaml" });
  assert.doesNotMatch(prompt, /\{\{GROUND_TRUTH_FILENAME\}\}/);
  assert.match(prompt, /example\.domain\.yaml/);
});

test("persona-eszter.md's trimmed remainder no longer duplicates any of the sections the wrapper now owns", () => {
  const trimmedPath = path.resolve(__dirname, "evals", "fixtures", "persona-eszter.md");
  const text = fs.readFileSync(trimmedPath, "utf8");
  for (const heading of [
    "## Hidden-ground-truth rule", "## How to answer different interview question types",
    "## Interview behaviour designed for ontology-recovery experiments",
    "## Consistency checklist for every answer", "## Ending the interview",
  ]) {
    assert.doesNotMatch(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  // But the itops-specific sections are still there.
  for (const heading of ["## Persona", "## Character and communication style", "## What you know", "## Opening response"]) {
    assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
