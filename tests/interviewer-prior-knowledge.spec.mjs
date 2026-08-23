import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { computeFirstSpeakerIdentifiers, crossReferenceMatchedIdentifiers } from "./evals/lib/interviewerPriorKnowledge.mjs";
import { collectMultiSegmentIdentifiers } from "./evals/lib/leakDetector.mjs";
import { resolveDomainYamlPath, loadGroundTruthModel } from "./evals/lib/groundTruthModel.mjs";
import { parseConversationLog } from "./evals/lib/reportGenerator.mjs";
import { recoveredStateFromYaml } from "./evals/score-baseline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Issue #137: the interviewer-side mirror of #133's own persona-side leak
// audit -- see interviewerPriorKnowledge.mjs's own header for the full
// rationale. Synthetic unit tests first (fast, no real data dependency),
// then a real-data regression pinning this tool's actual output against
// the committed 4-domain x 3-replicate re-run, which doubles as the
// reproducible correction to PR #136's own unreproducible ad hoc figures
// (330 total interviewer-first / 162 matched across the same 12 runs --
// no script for that computation was ever committed anywhere in this
// repo's history, confirmed via `git log --all --grep`).

test("computeFirstSpeakerIdentifiers: an identifier the interviewer says before the persona ever does is interviewer-first", () => {
  const candidates = new Set(["AirHandlingUnit"]);
  const entries = [
    { turn: 1, speaker: "app-assistant", text: "Do you have an AirHandlingUnit?" },
    { turn: 1, speaker: "persona", text: "Yes, we call it that too." },
  ];
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, candidates);
  assert.deepEqual([...interviewerFirst], ["AirHandlingUnit"]);
  assert.deepEqual([...personaFirst], []);
});

test("computeFirstSpeakerIdentifiers: an identifier the persona says before the interviewer ever does is persona-first (the #133 leak shape)", () => {
  const candidates = new Set(["needsCoolingFromSetpoint"]);
  const entries = [
    { turn: 1, speaker: "app-assistant", text: "What do you call that rule?" },
    { turn: 1, speaker: "persona", text: "I'd use needsCoolingFromSetpoint." },
  ];
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, candidates);
  assert.deepEqual([...interviewerFirst], []);
  assert.deepEqual([...personaFirst], ["needsCoolingFromSetpoint"]);
});

test("computeFirstSpeakerIdentifiers: within one turn, the interviewer's own statement is credited before that same turn's persona reply is checked", () => {
  // Real transcripts share one turn number between app-assistant and
  // persona (confirmed during #133's post-merge verification) -- this is
  // the exact "interviewer proposes it, persona confirms it in the same
  // exchange" shape, and it must resolve to interviewer-first, not a tie
  // or a false persona-first credit.
  const candidates = new Set(["QualificationSpecification"]);
  const entries = [
    { turn: 5, speaker: "app-assistant", text: "Is it a QualificationSpecification?" },
    { turn: 5, speaker: "persona", text: "Yes, QualificationSpecification is right." },
  ];
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, candidates);
  assert.deepEqual([...interviewerFirst], ["QualificationSpecification"]);
  assert.deepEqual([...personaFirst], []);
});

test("computeFirstSpeakerIdentifiers: an identifier appearing in neither speaker's text is in neither set", () => {
  const candidates = new Set(["NeverMentioned"]);
  const entries = [{ turn: 1, speaker: "app-assistant", text: "Tell me about your process." }];
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, candidates);
  assert.equal(interviewerFirst.size, 0);
  assert.equal(personaFirst.size, 0);
});

test("crossReferenceMatchedIdentifiers: a class-id identifier that IS in heuristicMatches.classes counts as matched", () => {
  const domainYamlDoc = { classes: { AirHandlingUnit: {} }, relationships: [] };
  const groundTruth = { rules: [], actions: [] };
  const recoveredState = { rules: [], actions: [] };
  const heuristicMatches = { classes: [{ goldId: "AirHandlingUnit", recoveredId: "n1", weight: 1 }], relationships: [], properties: [] };
  const matched = crossReferenceMatchedIdentifiers({
    identifiers: new Set(["AirHandlingUnit", "SomethingElse"]), domainYamlDoc, groundTruth, recoveredState, heuristicMatches,
  });
  assert.deepEqual([...matched], ["AirHandlingUnit"]);
});

test("crossReferenceMatchedIdentifiers: a relationship identifier is mapped through the raw doc's own zero-indexed rel_N scheme, not a naive 1-indexed guess", () => {
  // Regression for the exact off-by-one #133's post-merge verification
  // caught in an ad hoc investigation script -- groundTruthModel.mjs's own
  // relationship ids are `rel_${index}` from a ZERO-indexed Array.map.
  const domainYamlDoc = {
    classes: { A: {}, B: {} },
    relationships: [
      { name: "firstRel", from: "A", to: "B" },   // rel_0
      { name: "secondRel", from: "A", to: "B" },  // rel_1
    ],
  };
  const groundTruth = { rules: [], actions: [] };
  const recoveredState = { rules: [], actions: [] };
  const heuristicMatches = { classes: [], relationships: [{ goldId: "rel_1", edgeId: "e1", direction: "forward" }], properties: [] };
  const matched = crossReferenceMatchedIdentifiers({
    identifiers: new Set(["firstRel", "secondRel"]), domainYamlDoc, groundTruth, recoveredState, heuristicMatches,
  });
  assert.deepEqual([...matched], ["secondRel"], "rel_1 is the SECOND (index 1) relationship, not the first");
});

test("crossReferenceMatchedIdentifiers: a relationship's alias is also recognized as matched, not just its primary name", () => {
  const domainYamlDoc = {
    classes: { A: {}, B: {} },
    relationships: [{ name: "prescribes", from: "A", to: "B", aliases: ["prescribedBy"] }],
  };
  const groundTruth = { rules: [], actions: [] };
  const recoveredState = { rules: [], actions: [] };
  const heuristicMatches = { classes: [], relationships: [{ goldId: "rel_0", edgeId: "e1", direction: "forward" }], properties: [] };
  const matched = crossReferenceMatchedIdentifiers({
    identifiers: new Set(["prescribedBy"]), domainYamlDoc, groundTruth, recoveredState, heuristicMatches,
  });
  assert.deepEqual([...matched], ["prescribedBy"]);
});

test("crossReferenceMatchedIdentifiers: a property bare name is matched existentially -- any matched property with that name, on any class", () => {
  const domainYamlDoc = { classes: {}, relationships: [] };
  const groundTruth = { rules: [], actions: [] };
  const recoveredState = { rules: [], actions: [] };
  const heuristicMatches = {
    classes: [], relationships: [],
    properties: [{ goldId: "SomeClass.hasSeverityLevel", hostNodeId: "n1", matchedPropertyName: "severity level" }],
  };
  const matched = crossReferenceMatchedIdentifiers({
    identifiers: new Set(["hasSeverityLevel", "hasUnrelatedProperty"]), domainYamlDoc, groundTruth, recoveredState, heuristicMatches,
  });
  assert.deepEqual([...matched], ["hasSeverityLevel"]);
});

test("crossReferenceMatchedIdentifiers: an identifier with no corresponding match anywhere is not counted as matched", () => {
  const domainYamlDoc = { classes: { A: {} }, relationships: [] };
  const groundTruth = { rules: [], actions: [] };
  const recoveredState = { rules: [], actions: [] };
  const heuristicMatches = { classes: [], relationships: [], properties: [] };
  const matched = crossReferenceMatchedIdentifiers({
    identifiers: new Set(["A"]), domainYamlDoc, groundTruth, recoveredState, heuristicMatches,
  });
  assert.equal(matched.size, 0);
});

// --- Real-data regression: the committed 4-domain x 3-replicate re-run ---
//
// This is the reproducible correction to PR #136's own unreproducible ad
// hoc figures for this exact same 12-run set (330 interviewer-first total,
// range 4-46/run, 162 matched ~30%). Spot-checking this tool's own output
// (interviewer-first identifiers on iof-maintenance/run-01, fibo-loans/
// run-01, brick-hvac/run-03 include real, sensible raw-identifier guesses
// like "MaintenanceProcess", "classifyItemAsFailed", "SecuredLoan",
// "TemperatureSensor" -- not garbage or an empty/broken result) gives
// confidence this tool is measuring the real thing, just arriving at a much
// smaller number than the prior ad hoc pass claimed. Reported, not
// resolved -- like #133's own still-open N1 echo-count discrepancy, this is
// left as a genuine, documented correction rather than silently adopted or
// silently ignored.
function analyzeCommittedRun(domain, runId) {
  const dir = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain", runId, domain);
  const domainYamlPath = resolveDomainYamlPath(domain);
  const domainYamlDoc = yaml.load(fs.readFileSync(domainYamlPath, "utf8"));
  const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: domainYamlPath });
  const candidateSet = collectMultiSegmentIdentifiers(domainYamlDoc);
  const entries = parseConversationLog(fs.readFileSync(path.join(dir, "conversation-log.md"), "utf8"));
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, candidateSet);
  const heuristicMatches = JSON.parse(fs.readFileSync(path.join(dir, "heuristic-matches.json"), "utf8"));
  const { state: recoveredState } = recoveredStateFromYaml(fs.readFileSync(path.join(dir, "recovered-model.yaml"), "utf8"));
  const matched = crossReferenceMatchedIdentifiers({ identifiers: interviewerFirst, domainYamlDoc, groundTruth, recoveredState, heuristicMatches });
  return { interviewerFirst, personaFirst, matched };
}

test("real-data regression: persona-first stays empty on every one of the 12 committed clean re-run transcripts (leak guard verification, for free)", () => {
  const domains = ["brick-hvac", "iof-maintenance", "iof-supply-chain", "fibo-loans"];
  const runs = ["run-01", "run-02", "run-03"];
  for (const domain of domains) {
    for (const runId of runs) {
      const { personaFirst } = analyzeCommittedRun(domain, runId);
      assert.equal(personaFirst.size, 0, `${domain}/${runId}: expected zero persona-first identifiers on a clean #133-fixed run`);
    }
  }
});

test("real-data regression: total interviewer-first count across the 12 committed runs is a genuinely small, reproducible number -- corrects PR #136's unreproducible 330 figure", () => {
  const domains = ["brick-hvac", "iof-maintenance", "iof-supply-chain", "fibo-loans"];
  const runs = ["run-01", "run-02", "run-03"];
  let totalInterviewerFirst = 0;
  let totalMatched = 0;
  for (const domain of domains) {
    for (const runId of runs) {
      const { interviewerFirst, matched } = analyzeCommittedRun(domain, runId);
      totalInterviewerFirst += interviewerFirst.size;
      totalMatched += matched.size;
    }
  }
  // Pinned to this tool's own actual, reproducible output -- not to PR
  // #136's figure, which no committed script can reproduce. A future
  // change to leakDetector.mjs's candidate-set definition or the matching
  // logic that moves this number is expected to update this assertion
  // deliberately, with a note explaining why -- not silently.
  assert.equal(totalInterviewerFirst, 31);
  assert.equal(totalMatched, 31);
});
