import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { trackToolActivityStreak, WASTED_TURN_THRESHOLD, excludeAlreadySaidByInterviewer } from "./evals/lib/conversationOrchestrator.mjs";
import { buildLeakCandidateSet, findLeakedIdentifiers } from "./evals/lib/leakDetector.mjs";
import { resolveDomainYamlPath, resolveDomainPersonaPath } from "./evals/lib/groundTruthModel.mjs";
import { parseConversationLog } from "./evals/lib/reportGenerator.mjs";

// Issue #133 N1/N2 (independent audit of the fix pass): both blockers were
// invisible to the synthetic unit tests and only became obvious once the
// new guards were replayed over real transcripts -- which is now possible
// with no API key at all, since E9's fix committed the real pre-fix 12-run
// data to ontology_translation/results/multi-domain-superseded-2026-08/.
// This is exactly the replay harness the audit's own suggested gate asked
// for: (a) no legitimately-finished real run trips the wasted-turn
// detector, (b) the leak guard (with N1's interviewer-exclusion) never
// false-positives on an identifier the interviewer already said, across
// every real committed transcript, (c) both real Finding B incidents are
// still caught.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVE_ROOT = path.resolve(__dirname, "..", "ontology_translation", "results", "multi-domain-superseded-2026-08");

function discoverRuns() {
  const runs = [];
  for (const runDir of fs.readdirSync(ARCHIVE_ROOT)) {
    const runPath = path.join(ARCHIVE_ROOT, runDir);
    if (!fs.statSync(runPath).isDirectory()) continue;
    for (const domain of fs.readdirSync(runPath)) {
      const dir = path.join(runPath, domain);
      const provPath = path.join(dir, "provenance.json");
      const logPath = path.join(dir, "conversation-log.md");
      if (!fs.existsSync(provPath) || !fs.existsSync(logPath)) continue;
      const prov = JSON.parse(fs.readFileSync(provPath, "utf8"));
      runs.push({ run: runDir, domain, dir, stoppedReason: prov.stoppedReason, turnsUsed: prov.turnsUsed });
    }
  }
  assert.ok(runs.length > 0, "expected the committed superseded archive to contain real runs -- test fixture assumption");
  return runs;
}

test("replay harness discovers all 12 real committed runs, with the 2 known pathological ones and 10 known-healthy ones", () => {
  const runs = discoverRuns();
  assert.equal(runs.length, 12);
  const pathological = runs.filter((r) => r.stoppedReason === "max_turns_reached");
  assert.equal(pathological.length, 2, "expected exactly the 2 real Finding B incidents");
  assert.deepEqual(
    new Set(pathological.map((r) => `${r.run}/${r.domain}`)),
    new Set(["run-02/brick-hvac", "run-03/iof-maintenance"]),
  );
});

test("N2 replay (real transcripts): no legitimately-finished real run trips the wasted-turn detector, and both real pathological runs still would be", () => {
  for (const r of discoverRuns()) {
    const entries = parseConversationLog(fs.readFileSync(path.join(r.dir, "conversation-log.md"), "utf8"));
    const maxTurn = Math.max(...entries.map((e) => e.turn));
    let state = { current: 0, max: 0 };
    let crossed = false;
    for (let turn = 1; turn <= maxTurn; turn++) {
      const hadTool = entries.some((e) => e.turn === turn && e.speaker === "app-tool");
      state = trackToolActivityStreak(state, hadTool);
      if (state.crossedThreshold) { crossed = true; break; }
    }
    const isPathological = r.stoppedReason === "max_turns_reached";
    if (isPathological) {
      assert.ok(crossed, `${r.run}/${r.domain}: expected the real pathological run to trip the wasted-turn detector (max streak was ${state.max})`);
    } else {
      assert.ok(!crossed, `${r.run}/${r.domain}: expected a legitimately-finished real run NOT to trip the wasted-turn detector (max streak was ${state.max})`);
    }
  }
});

test("N1 replay (real transcripts): the leak guard's interviewer-exclusion eliminates every echo-only false positive, across all 12 real committed runs", () => {
  let totalEchoFlagsUnderOldLogic = 0;
  let totalEchoFlagsRemainingUnderNewLogic = 0;
  let totalGenuineFlagsUnderNewLogic = 0;

  for (const r of discoverRuns()) {
    const doc = yaml.load(fs.readFileSync(resolveDomainYamlPath(r.domain), "utf8"));
    const personaPath = resolveDomainPersonaPath(r.domain);
    const briefText = fs.readFileSync(personaPath, "utf8");
    const leakCandidates = buildLeakCandidateSet(doc, briefText);

    const entries = parseConversationLog(fs.readFileSync(path.join(r.dir, "conversation-log.md"), "utf8"));
    const maxTurn = Math.max(...entries.map((e) => e.turn));
    const identifiersSaidByInterviewer = new Set();

    for (let turn = 1; turn <= maxTurn; turn++) {
      const appText = (entries.find((e) => e.turn === turn && e.speaker === "app-assistant") || {}).text || "";
      const personaText = (entries.find((e) => e.turn === turn && e.speaker === "persona") || {}).text || "";

      // Old logic (pre-N1): every candidate is checked, with no exclusion.
      // An "echo" flag here is one where the interviewer had ALREADY said
      // that exact identifier at some earlier turn -- exactly the false
      // positive class N1 exists to eliminate.
      const oldFlags = personaText ? findLeakedIdentifiers(personaText, leakCandidates) : [];
      totalEchoFlagsUnderOldLogic += oldFlags.filter((id) => identifiersSaidByInterviewer.has(id)).length;

      // New logic (N1): exclude what the interviewer already said, mirroring
      // the exact order of operations the real orchestrator uses -- record
      // the interviewer's turn BEFORE checking the persona's reply to it.
      if (appText) for (const id of findLeakedIdentifiers(appText, leakCandidates)) identifiersSaidByInterviewer.add(id);
      if (personaText) {
        const effective = excludeAlreadySaidByInterviewer(leakCandidates, identifiersSaidByInterviewer);
        const newFlags = findLeakedIdentifiers(personaText, effective);
        // Computed independently of the exclusion mechanism itself (checked
        // against the FULL identifiersSaidByInterviewer set, not derived
        // from `effective`) -- a real empirical check, not a tautology.
        totalEchoFlagsRemainingUnderNewLogic += newFlags.filter((id) => identifiersSaidByInterviewer.has(id)).length;
        totalGenuineFlagsUnderNewLogic += newFlags.length;
      }
    }
  }

  assert.ok(totalEchoFlagsUnderOldLogic > 0, "expected the pre-N1 logic to have real echo-only false positives to eliminate -- test fixture assumption");
  assert.equal(totalEchoFlagsRemainingUnderNewLogic, 0, "no echo-only flag should survive N1's interviewer-exclusion");
  console.log(`    (replay: ${totalEchoFlagsUnderOldLogic} echo-only false positives under the old logic, all eliminated; ${totalGenuineFlagsUnderNewLogic} genuinely novel flags remain under the new logic)`);
});
