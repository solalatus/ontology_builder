import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { withPage } from "./lib/page.mjs";
import { computeOntologyDiff, isOntologyDiffEmpty, summarizeOntologyDiff, formatOntologyDiffMarkdown } from "./evals/lib/ontologyDiff.mjs";
import { extractCandidateYaml, extractChangeManifest, validateCandidate, parseCandidate, sha256, NORMALIZER_PROMPT_SHA256, POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1 } from "./evals/lib/normalizerPromptV1.mjs";
import { blindingFor, parseJudgeVerdict, resolveVerdict } from "./evals/judge-post-normalization.mjs";
import { POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2, NORMALIZER_PROMPT_SHA256_V2, V2_ADDED_CONSTRAINTS } from "./evals/lib/normalizerPromptV2.mjs";
import { resolveCondition, parseConditionArgs } from "./evals/lib/conditions.mjs";
import { recoveredStateFromYaml } from "./evals/score-baseline.mjs";
import { loadGroundTruthModel, scopeGroundTruth } from "./evals/lib/groundTruthModel.mjs";
import { computeRecoveryMetrics } from "./evals/lib/recoveryMetrics.mjs";

// OFFLINE TESTS FOR THE post-normalization-v1 CONDITION (issue #75)
//
// Everything here runs with no API key and no network: the diff engine, the
// reply parsers, the candidate validator, the blinding and verdict-resolution
// logic, EXPERIMENT_BRIEF.md §8's acceptance checks 1-3, and -- once the
// condition has actually been run -- checks over its committed artifacts,
// including whether each candidate still loads into the real app.
//
// In the DEFAULT suite on purpose (tests/*.spec.mjs), unlike the API-consuming
// scripts under tests/evals/. The artifact-dependent tests skip cleanly when
// the condition has not been generated, so a fresh checkout stays green while
// a checkout that has the results gets them checked on every ordinary run.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = path.join(__dirname, "evals", "results", "runs");
const BASELINES = path.join(__dirname, "evals", "results", "baselines");
const CONDITIONS = ["post-normalization-v1", "post-normalization-v2"];
const condDir = (name) => path.join(BASELINES, name);
const COND_DIR = condDir(CONDITIONS[0]); // v1 -- the condition whose frozen-input manifest is checked below
const RUN_IDS = ["run-01", "run-02", "run-03"];

const doc = (text) => yaml.load(text);
// Only the conditions actually generated in this checkout are checked; a fresh
// clone with neither of them still runs green.
const generatedConditions = () => CONDITIONS.filter((c) => RUN_IDS.every((r) => fs.existsSync(path.join(condDir(c), r, "recovered-model.yaml"))));
const hasCandidates = () => generatedConditions().length > 0;

// ---------------------------------------------------------------------------
// The deterministic semantic diff (issue #75 §7)
// ---------------------------------------------------------------------------

const BASE = `
classes:
  Incident:
    meaning: "An unplanned event."
    aliases: [ticket]
    properties:
      status:
        type: text
        allowed: [new, closed]
      severity:
        type: text
  Engineer:
    meaning: "A person who works incidents."
relationships:
  - name: assignedTo
    from: Incident
    to: Engineer
    meaning: "The incident is assigned to the engineer."
rules:
  canClose:
    conditions:
      - Incident status is not new.
actions:
  closeIncident:
    input: Incident
    preconditions: [canClose]
    effect: Status becomes closed.
    verification: Read it back.
`;

test("an unchanged ontology produces an empty semantic diff", () => {
  const diff = computeOntologyDiff(doc(BASE), doc(BASE));
  assert.equal(isOntologyDiffEmpty(diff), true);
  assert.equal(summarizeOntologyDiff(diff).totalChanges, 0);
  assert.match(formatOntologyDiffMarkdown(diff), /No semantic change/);
});

test("the diff compares semantics, not key order or formatting", () => {
  // Same model, different ordering and different quoting/flow style: a diff
  // that reported this as a change would flood every real result with noise.
  const reordered = `
classes:
  Engineer:
    meaning: A person who works incidents.
  Incident:
    aliases:
      - ticket
    meaning: An unplanned event.
    properties:
      severity: {type: text}
      status:
        allowed: [closed, new]
        type: text
rules:
  canClose: {conditions: ["Incident status is not new."]}
actions:
  closeIncident:
    verification: Read it back.
    input: Incident
    effect: Status becomes closed.
    preconditions: [canClose]
relationships:
  - to: Engineer
    from: Incident
    name: assignedTo
    meaning: The incident is assigned to the engineer.
`;
  assert.equal(isOntologyDiffEmpty(computeOntologyDiff(doc(BASE), doc(reordered))), true);
});

test("class, property, rule and action changes are reported in their own categories", () => {
  const after = doc(BASE);
  after.classes.Incident.meaning = "An unplanned operational event.";
  after.classes.Incident.aliases = ["ticket", "case"];
  after.classes.Incident.properties.status.allowed = ["new", "closed", "cancelled"];
  delete after.classes.Incident.properties.severity;
  after.classes.Incident.properties.impact = { type: "text" };
  delete after.classes.Engineer;
  after.classes.ResolverGroup = { meaning: "A team." };
  after.rules.canClose.conditions = ["Incident status is not new.", "Evidence is recorded."];
  after.actions.closeIncident.preconditions = [];
  delete after.actions.closeIncident.verification;

  const diff = computeOntologyDiff(doc(BASE), after);
  assert.deepEqual(diff.classes.added.map((c) => c.name), ["ResolverGroup"]);
  assert.deepEqual(diff.classes.removed.map((c) => c.name), ["Engineer"]);
  assert.equal(diff.classes.changed.length, 1);
  assert.deepEqual(diff.classes.changed[0].aliasesAdded, ["case"]);
  assert.deepEqual(diff.properties.added, [{ className: "Incident", name: "impact" }]);
  assert.deepEqual(diff.properties.removed, [{ className: "Incident", name: "severity" }]);
  assert.deepEqual(diff.properties.changed[0].allowedAdded, ["cancelled"]);
  assert.deepEqual(diff.rules.changed[0].conditionsAdded, ["Evidence is recorded."]);
  assert.deepEqual(diff.actions.changed[0].preconditionsRemoved, ["canClose"]);
  assert.equal(diff.actions.changed[0].verificationChanged, true);
});

test("a reversed relationship is one direction change, not a removal plus an addition", () => {
  const after = doc(BASE);
  after.relationships = [{ name: "assignedTo", from: "Engineer", to: "Incident", meaning: "The incident is assigned to the engineer." }];
  const diff = computeOntologyDiff(doc(BASE), after);
  assert.equal(diff.relationships.directionChanged.length, 1);
  assert.equal(diff.relationships.added.length, 0);
  assert.equal(diff.relationships.removed.length, 0);
  assert.match(diff.relationships.directionChanged[0].label, /Incident --assignedTo--> Engineer/);
  assert.match(diff.relationships.directionChanged[0].newLabel, /Engineer --assignedTo--> Incident/);
});

test("a renamed relationship endpoint is an ordinary removal plus addition (no rename detection, by design)", () => {
  const after = doc(BASE);
  after.classes.ResolverGroup = { meaning: "A team." };
  after.relationships = [{ name: "assignedTo", from: "Incident", to: "ResolverGroup" }];
  const diff = computeOntologyDiff(doc(BASE), after);
  assert.equal(diff.relationships.removed.length, 1);
  assert.equal(diff.relationships.added.length, 1);
  assert.equal(diff.relationships.directionChanged.length, 0);
});

test("relationship meaning and alias edits are `changed`, not add/remove churn", () => {
  const after = doc(BASE);
  after.relationships[0].meaning = "Ownership of the incident sits with this engineer.";
  after.relationships[0].aliases = ["owned by"];
  const diff = computeOntologyDiff(doc(BASE), after);
  assert.equal(diff.relationships.changed.length, 1);
  assert.deepEqual(diff.relationships.changed[0].aliasesAdded, ["owned by"]);
  assert.equal(diff.relationships.added.length + diff.relationships.removed.length, 0);
});

test("the diff tolerates absent and malformed sections without throwing", () => {
  assert.equal(isOntologyDiffEmpty(computeOntologyDiff({}, {})), true);
  assert.equal(isOntologyDiffEmpty(computeOntologyDiff(null, undefined)), true);
  const diff = computeOntologyDiff({ classes: { A: null }, relationships: "not a list" }, { classes: { A: {} }, relationships: [null, { name: "r", from: "A", to: "A" }] });
  assert.equal(diff.relationships.added.length, 1);
});

// ---------------------------------------------------------------------------
// Reply parsing (EXPERIMENT_BRIEF.md §8 check 3)
// ---------------------------------------------------------------------------

test("candidate extraction accepts bare, yaml-fenced, plain-fenced and preamble-then-fenced replies", () => {
  const body = "classes:\n  A:\n    meaning: x\n";
  assert.match(extractCandidateYaml(body), /^classes:/);
  assert.match(extractCandidateYaml("```yaml\n" + body + "```"), /^classes:/);
  assert.match(extractCandidateYaml("```yml\n" + body + "```"), /^classes:/);
  assert.match(extractCandidateYaml("```\n" + body + "```"), /^classes:/);
  assert.match(extractCandidateYaml("Here is the model.\n\n```yaml\n" + body + "```\n\nDone."), /^classes:/);
});

test("candidate extraction picks the ontology block even when a manifest block is present", () => {
  const reply = "```yaml\nclasses:\n  A:\n    meaning: x\n```\n\n```json\n[{\"changeType\":\"x\"}]\n```";
  assert.match(extractCandidateYaml(reply), /^classes:/);
  assert.equal(extractCandidateYaml(reply).includes("changeType"), false);
});

test("candidate extraction fails loudly on a prose-only reply", () => {
  assert.throws(() => extractCandidateYaml("I reviewed the ontology and found nothing to change."), /no `classes:` block/);
  assert.throws(() => extractCandidateYaml("```json\n[]\n```"), /no `classes:` block/);
});

test("manifest extraction returns entries when present and a warning when absent", () => {
  const withManifest = "```yaml\nclasses:\n  A: {}\n```\n```json\n[{\"changeType\":\"reverse-relationship-direction\",\"summary\":\"s\"}]\n```";
  const { manifest, warning } = extractChangeManifest(withManifest);
  assert.equal(warning, null);
  assert.equal(manifest.length, 1);
  const missing = extractChangeManifest("```yaml\nclasses:\n  A: {}\n```");
  assert.equal(missing.manifest, null);
  assert.match(missing.warning, /no parseable JSON array/);
});

// ---------------------------------------------------------------------------
// Candidate validation
// ---------------------------------------------------------------------------

test("a well-formed candidate validates clean", () => {
  const { errors, warnings } = validateCandidate(doc(BASE));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test("validation rejects the defects that would make a candidate unfit to apply", () => {
  const broken = doc(BASE);
  broken.relationships.push({ name: "reportedBy", from: "Incident", to: "Customer" });
  broken.classes.Incident.properties.status.type = "enum";
  broken.actions.escalate = { input: "Manager", preconditions: ["noSuchRule"], effect: "e", verification: "v" };
  const { errors } = validateCandidate(broken);
  assert.equal(errors.some((e) => /undeclared class "Customer"/.test(e)), true);
  assert.equal(errors.some((e) => /unsupported type "enum"/.test(e)), true);
  assert.equal(errors.some((e) => /action escalate: `input` names undeclared class "Manager"/.test(e)), true);
  assert.equal(errors.some((e) => /precondition "noSuchRule" names no declared rule/.test(e)), true);
});

test("validation warns, but does not reject, on profile violations that still load", () => {
  const offProfile = doc(BASE);
  offProfile.relationships.push({ name: "worksOn", from: "Engineer", to: "Incident" });
  const { errors, warnings } = validateCandidate(offProfile);
  assert.deepEqual(errors, []);
  assert.equal(warnings.some((w) => /may be an inverse of/.test(w)), true);
});

test("a candidate without a classes mapping is a hard failure, not an empty model", () => {
  assert.equal(validateCandidate({ relationships: [] }).errors[0], "candidate has no `classes:` mapping");
  assert.equal(validateCandidate(doc("classes: a bare string")).errors[0], "candidate has no `classes:` mapping");
  assert.equal(validateCandidate("not a document at all").errors[0], "candidate is not a YAML mapping");
  assert.throws(() => parseCandidate("classes:\n  - [unclosed\n"), /does not parse/);
});

// ---------------------------------------------------------------------------
// Blinding and verdict resolution (issue #75 §9)
// ---------------------------------------------------------------------------

test("the blind A/B assignment is deterministic and varies across runs and judges", () => {
  assert.deepEqual(blindingFor("run-01", "judge-x"), blindingFor("run-01", "judge-x"));
  const keys = new Set(["run-01", "run-02", "run-03"].flatMap((r) => ["judge-x", "judge-y"].map((j) => blindingFor(r, j).key)));
  assert.equal(keys.size, 6, "each (run, judge) pair must get its own blinding key");
});

test("a positional verdict is un-blinded to the right subject in both assignments", () => {
  const verdict = {
    preferred: "B", confidence: "high",
    material_regressions_A: ["a defect in A"], material_regressions_B: [],
    unsupported_additions_A: [], unsupported_additions_B: ["an invention in B"],
    competency_coverage_loss_A: [], competency_coverage_loss_B: [],
    short_reason: "because",
  };
  const originalIsA = resolveVerdict(verdict, { originalIsA: true });
  assert.equal(originalIsA.preferred, "normalized");
  assert.deepEqual(originalIsA.material_regressions_original, ["a defect in A"]);
  assert.deepEqual(originalIsA.unsupported_additions_normalized, ["an invention in B"]);

  const originalIsB = resolveVerdict(verdict, { originalIsA: false });
  assert.equal(originalIsB.preferred, "original");
  assert.deepEqual(originalIsB.material_regressions_normalized, ["a defect in A"]);
  assert.deepEqual(originalIsB.unsupported_additions_original, ["an invention in B"]);

  assert.equal(resolveVerdict({ ...verdict, preferred: "tie" }, { originalIsA: true }).preferred, "tie");
});

test("judge replies without a usable verdict fail loudly", () => {
  assert.equal(parseJudgeVerdict('```json\n{"preferred":"A","confidence":"low"}\n```').preferred, "A");
  assert.equal(parseJudgeVerdict('{"preferred":"tie"}').preferred, "tie");
  // An UNTERMINATED fence: a real reply shape that aborted the first judge
  // batch (see results/.../judge/raw-aborted-parser-bug/). The verdict object
  // is perfectly well formed; only the closing fence is missing.
  assert.equal(parseJudgeVerdict('```json\n{"preferred":"B","confidence":"high"}').preferred, "B");
  assert.equal(parseJudgeVerdict('Here is my verdict.\n\n{"preferred":"A"}\n\nThanks.').preferred, "A");
  assert.throws(() => parseJudgeVerdict("Model A is better."), /no parseable verdict/);
  assert.throws(() => parseJudgeVerdict('```json\n{"preferred":"maybe"}\n```'), /no parseable verdict/);
});

// ---------------------------------------------------------------------------
// EXPERIMENT_BRIEF.md §8 acceptance checks 1 and 2
// ---------------------------------------------------------------------------

test("identity check: scoring a byte-copy of an interactive model gives exactly zero delta in every dimension and scope", () => {
  const full = loadGroundTruthModel();
  const scoped = scopeGroundTruth(full, full.practicalScopeClassIds, full.practicalScopePropertyIds);
  for (const runId of RUN_IDS) {
    const text = fs.readFileSync(path.join(RUNS_DIR, runId, "recovered-model.yaml"), "utf8");
    const a = recoveredStateFromYaml(text);
    const b = recoveredStateFromYaml(text);
    for (const gold of [full, scoped]) {
      const ma = computeRecoveryMetrics(gold, a.state);
      const mb = computeRecoveryMetrics(gold, b.state);
      for (const dim of ["classes", "relationships", "properties"]) {
        assert.equal(mb[dim].f1 - ma[dim].f1, 0, `${runId} ${dim} must be identical to itself`);
      }
    }
  }
});

test("degenerate-input check: a near-empty model and an undeclared-endpoint edge both score without crashing", () => {
  const full = loadGroundTruthModel();
  const empty = recoveredStateFromYaml("classes: {}\nrelationships: []\n");
  assert.equal(empty.droppedEdges, 0);
  const metrics = computeRecoveryMetrics(full, empty.state);
  assert.equal(metrics.classes.f1, 0);

  const dangling = recoveredStateFromYaml("classes:\n  A:\n    meaning: x\nrelationships:\n  - name: r\n    from: A\n    to: Ghost\n");
  assert.equal(dangling.droppedEdges, 1, "an edge naming an undeclared endpoint must be dropped and counted");
  assert.equal(dangling.state.edges.length, 0);
  assert.doesNotThrow(() => computeRecoveryMetrics(full, dangling.state));
});

// ---------------------------------------------------------------------------
// The frozen normalizer prompt and the frozen anchor inputs
// ---------------------------------------------------------------------------

test("the v1 normalizer prompt is frozen at its published hash", () => {
  // Same rule as the interviewer's golden hash (see
  // tests/agent-production-invariants.spec.mjs): a change here invalidates
  // every result already reported against v1. A new version is a new constant
  // and a new condition directory, not an edit to this one.
  assert.equal(NORMALIZER_PROMPT_SHA256, sha256(POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1));
  assert.equal(NORMALIZER_PROMPT_SHA256, "a0f52cb08189eb4de142fa4b5c4b10299c3ccb101d574924274c60a423956489");
});

test("v2 is v1 plus exactly the two added constraints, and nothing else", () => {
  // This is the single-factor guarantee for the v1-vs-v2 comparison, and it is
  // asserted rather than asserted-in-a-comment: if a later edit reworded any
  // part of the shared prompt while adding a third rule, the two conditions
  // would stop being comparable and this fails.
  const a = POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1.split("\n");
  const b = POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2.split("\n");
  const added = V2_ADDED_CONSTRAINTS.split("\n");
  assert.equal(b.length - a.length, added.length);

  // Removing the inserted block from v2 must give back v1 byte for byte.
  const start = b.findIndex((line, i) => line !== a[i]);
  assert.ok(start > 0, "v2 must differ from v1 somewhere after the first line");
  assert.deepEqual(b.slice(start, start + added.length), added);
  assert.equal([...b.slice(0, start), ...b.slice(start + added.length)].join("\n"), POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V1);

  assert.equal(NORMALIZER_PROMPT_SHA256_V2, sha256(POST_INTERVIEW_NORMALIZER_SYSTEM_PROMPT_V2));
  assert.equal(NORMALIZER_PROMPT_SHA256_V2, "d0e35420331c153b901cc7a620e54fe0b1afd27f9bce36dfed649d5e3fbb93c3");
  assert.notEqual(NORMALIZER_PROMPT_SHA256_V2, NORMALIZER_PROMPT_SHA256);
});

test("the condition registry resolves both versions and holds the model fixed between them", () => {
  const v1 = resolveCondition("post-normalization-v1");
  const v2 = resolveCondition("post-normalization-v2");
  assert.equal(v1.promptSha256, NORMALIZER_PROMPT_SHA256);
  assert.equal(v2.promptSha256, NORMALIZER_PROMPT_SHA256_V2);
  // Same normalizer model, or the prompt is not the only thing that varied.
  assert.equal(v1.defaultModel, v2.defaultModel);
  assert.equal(resolveCondition().name, "post-normalization-v1", "the default must stay v1 so older invocations keep working");
  assert.throws(() => resolveCondition("post-normalization-v99"), /unknown condition/);
  assert.deepEqual(parseConditionArgs(["--condition=post-normalization-v2", "run-01", "run-02"]).runIds, ["run-01", "run-02"]);
  assert.equal(parseConditionArgs(["--condition=post-normalization-v2", "run-01"]).condition.name, "post-normalization-v2");
});

test("no frozen anchor artifact this condition read has changed since it ran", { skip: !fs.existsSync(path.join(COND_DIR, "frozen-inputs.sha256.json")) && "condition not generated yet" }, () => {
  // EXPERIMENT_BRIEF.md §4.1 -- "Never modify anything under results/runs/".
  // The runner recorded a hash of every file it opened; recomputing them here
  // turns that promise into something a later reader can check rather than
  // take on trust.
  const { inputs } = JSON.parse(fs.readFileSync(path.join(COND_DIR, "frozen-inputs.sha256.json"), "utf8"));
  for (const [runId, rec] of Object.entries(inputs)) {
    assert.equal(sha256(fs.readFileSync(path.join(__dirname, "..", rec.transcriptPath), "utf8")), rec.transcriptSha256, `${runId} transcript changed`);
    assert.equal(sha256(fs.readFileSync(path.join(__dirname, "..", rec.ontologyPath), "utf8")), rec.ontologySha256, `${runId} ontology changed`);
  }
});

// ---------------------------------------------------------------------------
// Checks over the committed condition artifacts
// ---------------------------------------------------------------------------

test("every committed candidate parses, validates, and carries complete provenance", { skip: !hasCandidates() && "condition not generated yet" }, () => {
  for (const [condition, runId] of generatedConditions().flatMap((c) => RUN_IDS.map((r) => [c, r]))) {
    const dir = path.join(condDir(condition), runId);
    const candidate = parseCandidate(fs.readFileSync(path.join(dir, "recovered-model.yaml"), "utf8"));
    const { errors } = validateCandidate(candidate);
    assert.deepEqual(errors, [], `${runId}: candidate has hard validation errors`);

    const prov = JSON.parse(fs.readFileSync(path.join(dir, "baseline-provenance.json"), "utf8"));
    for (const field of ["condition", "runId", "generatedAt", "model", "modelReported", "requestParams",
      "normalizerPromptSha256", "sourceTranscriptSha256", "sourceOntologySha256", "usage", "diffSummary"]) {
      assert.ok(prov[field] !== undefined && prov[field] !== null, `${runId}: provenance is missing ${field}`);
    }
    assert.equal(prov.condition, condition, `${runId}: provenance names a different condition`);
    assert.equal(prov.normalizerPromptSha256, resolveCondition(condition).promptSha256,
      `${condition}/${runId}: candidate was produced by a different prompt version`);
  }
});

test("each committed diff matches what the committed before/after pair actually says", { skip: !hasCandidates() && "condition not generated yet" }, () => {
  // The stored diff is the report's evidence, so it has to be reproducible
  // from the two ontologies rather than trusted as a by-product of the run.
  for (const [condition, runId] of generatedConditions().flatMap((c) => RUN_IDS.map((r) => [c, r]))) {
    const before = parseCandidate(fs.readFileSync(path.join(RUNS_DIR, runId, "recovered-model.yaml"), "utf8"));
    const after = parseCandidate(fs.readFileSync(path.join(condDir(condition), runId, "recovered-model.yaml"), "utf8"));
    const recomputed = computeOntologyDiff(before, after);
    const stored = JSON.parse(fs.readFileSync(path.join(condDir(condition), runId, "normalization-diff.json"), "utf8"));
    assert.deepEqual(JSON.parse(JSON.stringify(recomputed)), stored, `${condition}/${runId}: stored diff does not match a fresh recomputation`);
  }
});

test("every committed candidate still loads into the real app without losing content", { skip: !hasCandidates() && "condition not generated yet" }, async () => {
  // The production-integration question this condition feeds into (issue #75
  // §13, issue #80 §14) is whether a candidate can actually be APPLIED, not
  // merely scored. This drives the app's own YAML import path -- the same
  // parseDomainYamlImport/commitYamlImport pipeline `Apply` would use -- with
  // "replace" semantics, then re-exports and diffs. Anything the app silently
  // drops shows up here rather than in production.
  for (const [condition, runId] of generatedConditions().flatMap((c) => RUN_IDS.map((r) => [c, r]))) {
    const candidateYaml = fs.readFileSync(path.join(condDir(condition), runId, "recovered-model.yaml"), "utf8");
    await withPage(async (page) => {
      const exported = await page.evaluate((text) => {
        window.__kg.formats.openImportDialog(text, "yaml");
        document.getElementById("import-replace").click();
        return window.__kg.formats.buildDomainYamlExport();
      }, candidateYaml);
      const diff = computeOntologyDiff(parseCandidate(candidateYaml), parseCandidate(exported));
      assert.deepEqual(diff.classes.removed, [], `${condition}/${runId}: the app dropped classes on import`);
      assert.deepEqual(diff.relationships.removed, [], `${condition}/${runId}: the app dropped relationships on import`);
      assert.deepEqual(diff.properties.removed, [], `${condition}/${runId}: the app dropped properties on import`);
      assert.deepEqual(diff.rules.removed, [], `${condition}/${runId}: the app dropped rules on import`);
      assert.deepEqual(diff.actions.removed, [], `${condition}/${runId}: the app dropped actions on import`);
    });
  }
});
