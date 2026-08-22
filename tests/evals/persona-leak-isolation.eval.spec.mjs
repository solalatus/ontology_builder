import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createPersonaAgent } from "./lib/personaAgent.mjs";
import { resolveDomainPersonaPath, resolveDomainYamlPath } from "./lib/groundTruthModel.mjs";
import { buildLeakCandidateSet, findLeakedIdentifiers } from "./lib/leakDetector.mjs";
import { loadEnvKey } from "../lib/env.mjs";
import yaml from "js-yaml";

// Issue #133/E13 item 3 (external audit): "build an isolated persona-only
// regression suite seeded from the real failure transcripts... but do NOT
// invoke it with real Azure calls in this pass." This is that suite -- a
// live, OpenAI-key-gated harness (skipped without OPENAI_API_KEY, same
// pattern every other *.eval.spec.mjs file in this directory uses), built
// and committed now, deliberately not run against a real key in this pass.
// It exercises the persona IN ISOLATION -- no browser, no app agent, no full
// multi-turn conversation -- replaying the exact real interviewer message
// that triggered a real, measured leak in the actual 12-run multi-domain
// benchmark, and asserting the fixed persona (root-cause rendering + wrapper
// prompt fix, both from this same issue) no longer reproduces it.
//
// Each scenario below is transcribed verbatim from a real completed run
// still on disk under ontology_translation/results/multi-domain/ at the time
// this suite was written (run directories are gitignored, not committed --
// see issue #133/E9 -- so the scenario text here IS the permanent record):
//   - brick-hvac run-03, turn 49: the interviewer proposed three rule names
//     (needsCooling/needsHeating/withinTemperatureDeadband); the persona's
//     real reply substituted its own raw internal rule identifiers verbatim
//     (needsCoolingFromSetpoint, needsHeatingFromSetpoint,
//     temperatureWithinDeadband).
//   - iof-maintenance run-02, turn 5: the interviewer proposed keeping a
//     class named "Qualification"; the persona's real reply renamed it to
//     the raw internal class identifier "QualificationSpecification"
//     verbatim.
//   - fibo-loans run-02, turn 6: the interviewer proposed a class named
//     "RateResetSchedule"; the persona's real reply corrected it to the raw
//     internal class identifier "InterestRateResetSchedule" verbatim.
// All three are the same underlying failure mode: a NAMING-confirmation
// question (not a relationship question) where the persona, instead of
// describing what makes its own phrasing more precise, simply handed over
// its exact internal reference-model term the moment the interviewer's
// guess was merely close.

const OPENAI_API_KEY = loadEnvKey("OPENAI_API_KEY");
const skip = OPENAI_API_KEY
  ? false
  : "Set OPENAI_API_KEY in a .env file at the repo root (see tests/README.md) to run the persona leak-isolation suite.";

const SCENARIOS = [
  {
    name: "brick-hvac run-03 turn 49 (rule-name confirmation)",
    domainId: "brick-hvac",
    interviewerMessage:
      "That's the right boundary.\n\n" +
      "Phase 7 recap:\n" +
      "- We have one solid rule candidate ready to record:\n" +
      "  - occupiedZoneRequiresControl\n" +
      "- We have clear decision logic for cooling / heating / deadband, but I still need to decide whether to store that as one rule with outcomes or as three separate named rules\n" +
      "- The economizer rule is correctly marked as an open item, not something we should fake with incomplete conditions\n\n" +
      "One focused question to finish the control decision rules cleanly:\n\n" +
      "Do you want these recorded as three separate named rules:\n" +
      "- needsCooling\n" +
      "- needsHeating\n" +
      "- withinTemperatureDeadband\n\n" +
      "or as one broader rule concept that describes the three-way decision in text?\n" +
      "Given this tool's format, separate named rules are usually cleaner, but I want your confirmation.",
  },
  {
    name: "iof-maintenance run-02 turn 5 (class-name confirmation)",
    domainId: "iof-maintenance",
    interviewerMessage:
      "Next class batch, again tied directly to your confirmed questions:\n" +
      "MaintenanceStrategy, Qualification, QualifiedMaintenancePerson, RequiredFunction, FailureModeCode, FailureEffect.\n\n" +
      "For each of those, does the agent need to identify, retrieve, connect, or pass it to a tool? If one should be renamed or excluded, say which.",
  },
  {
    name: "fibo-loans run-02 turn 6 (class-name confirmation)",
    domainId: "fibo-loans",
    interviewerMessage:
      "One focused follow-up before I record that refinement:\n\n" +
      "Which of these schedule classes does the agent need as distinct classes for the current scope: " +
      "LoanPaymentSchedule, AmortizationSchedule, InterestPaymentSchedule, PrincipalPaymentSchedule, RateResetSchedule?\n" +
      "Please answer keep/remove for each.",
  },
];

for (const scenario of SCENARIOS) {
  test(
    `persona leak isolation: ${scenario.name} no longer leaks a raw ground-truth identifier`,
    { skip },
    async () => {
      const personaPath = resolveDomainPersonaPath(scenario.domainId);
      assert.ok(personaPath, `domain "${scenario.domainId}" must have a persona.md`);
      const domainYamlPath = resolveDomainYamlPath(scenario.domainId);
      const groundTruthText = fs.readFileSync(domainYamlPath, "utf8");

      const persona = createPersonaAgent({
        apiKey: OPENAI_API_KEY,
        model: "gpt-4o-mini",
        personaPath,
        groundTruthText,
        groundTruthFilename: "reference.domain.yaml",
        groundTruthFormat: "domain-yaml",
      });

      const { text } = await persona.reply(scenario.interviewerMessage);
      assert.ok(text && text.trim(), "expected a real, non-empty persona reply");

      const doc = yaml.load(groundTruthText);
      const briefText = fs.readFileSync(personaPath, "utf8");
      const candidates = buildLeakCandidateSet(doc, briefText);
      const leaked = findLeakedIdentifiers(text, candidates);

      assert.deepEqual(leaked, [], `persona reply leaked raw identifier(s): ${leaked.join(", ")}\n\nFull reply:\n${text}`);
    },
  );
}
