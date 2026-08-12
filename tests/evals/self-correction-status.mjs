// LIVE STATUS FOR THE issue #85 BATCH
//
//   node tests/evals/self-correction-status.mjs
//
// Reads every arm/run's progress.json and baseline-provenance.json and prints
// one compact table. Offline, instant, safe to run at any point during a live
// batch -- it only reads. Exists because a six-interview batch takes hours and
// "is it still going, or is it stuck?" needs an answer that does not involve
// waiting for the next artifact.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "results", "baselines", "self-correcting-interviewer");
const ARMS = ["control", "treatment"];
const RUNS = ["run-01", "run-02", "run-03"];
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (err) { return null; } };
const mmss = (s) => `${String(Math.floor((s || 0) / 60)).padStart(2, "0")}:${String((s || 0) % 60).padStart(2, "0")}`;

const rows = [];
let done = 0, failed = 0, running = 0;
for (const arm of ARMS) {
  for (const runId of RUNS) {
    const dir = path.join(ROOT, arm, runId);
    const prov = read(path.join(dir, "baseline-provenance.json"));
    const prog = read(path.join(dir, "progress.json"));
    if (!prog && !prov) { rows.push({ arm, runId, state: "queued" }); continue; }
    if (prov) {
      done++;
      rows.push({ arm, runId, state: "COMPLETE", turns: prov.turnsUsed, sec: prov.wallClockSec,
        applies: prov.applyToolCalls, multi: prov.turnsWithMoreThanOneApply, stopped: prov.stoppedReason,
        findings: prov.toolResultsCarryingFindings });
      continue;
    }
    if (prog.phase === "failed") { failed++; rows.push({ arm, runId, state: `FAILED(${prog.failureKind})`, note: (prog.error || "").slice(0, 90) }); continue; }
    running++;
    rows.push({ arm, runId, state: prog.phase, turns: prog.turnsUsed, sec: prog.elapsedSec,
      applies: prog.appliesSoFar, note: (prog.lastAppLine || "").replace(/\s+/g, " ").slice(0, 70) });
  }
}

console.log(`#85 batch — ${done}/6 complete, ${running} running, ${failed} failed`);
console.log("arm        run      state              turns  elapsed  applies  multi  detail");
for (const r of rows) {
  console.log(
    `${r.arm.padEnd(10)} ${r.runId.padEnd(8)} ${String(r.state).padEnd(18)} `
    + `${String(r.turns ?? "-").padStart(5)}  ${mmss(r.sec).padStart(7)}  `
    + `${String(r.applies ?? "-").padStart(7)}  ${String(r.multi ?? "-").padStart(5)}  `
    + `${r.stopped || r.note || ""}`);
}
