// ISSUE #182: RUN ONE BLOCK OF THE PAIRED-STAGE PROTOCOL
//
//   node tests/evals/run-paired-stages.mjs --block=1 [--runs=fibo-loans:run-01,brick-hvac:run-01] [--budget=200]
//
// Runs the block's interviews one after another (never in parallel: one run
// alone comes close to the deployment's tokens-per-minute limit late in the
// conversation), each through run-multi-domain-benchmark.mjs with the
// protocol's fixed settings (ontology_translation/results/paired-stages/
// DESIGN.md). Stops, rather than spending more, as soon as
//   - a run fails, or ends any way other than all three stages done;
//   - the money spent so far in this results tree reaches --budget (USD).
// A completed run is never re-run (the runner skips it), so starting this
// again after a stop resumes where it left off.
//
// Block 1 is the interviewer at explicit `medium`, block 2 at explicit `high`.
// Each line of output is also appended to <block dir>/block.log.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
export const RESULTS_ROOT = path.join(ROOT, "ontology_translation", "results", "paired-stages");

export const BLOCKS = {
  1: { dir: "block-1-medium", effort: "medium" },
  2: { dir: "block-2-high", effort: "high" },
};

// Interleaved, so a block stopped early still has both domains.
export const DEFAULT_RUNS = ["run-01", "run-02", "run-03"].flatMap((r) => [`fibo-loans:${r}`, `brick-hvac:${r}`]);

// The protocol's fixed settings (DESIGN.md, "Fixed for every run").
export function protocolEnv(effort) {
  return {
    LLM_PROVIDER: "azure",
    LLM_MODEL: "gpt-6-sol",
    EVAL_REASONING_EFFORT: effort,
    ONTOLOGY_EVAL_COVERAGE_SWEEP: "1",
    ONTOLOGY_EVAL_NAMING_PASS: "1",
    ONTOLOGY_EVAL_SWEEP_MAX_ROUNDS: "3",
    ONTOLOGY_EVAL_WALLCLOCK_MINUTES: "120",
    ONTOLOGY_EVAL_MAX_TURNS: "300",
    ONTOLOGY_EVAL_APP_TURN_TIMEOUT_SEC: "600",
    EVAL_RUN_COST_CAP_USD: "30",
  };
}

/** Money recorded as spent by every run under `root` (complete or not). */
export function spentUsd(root = RESULTS_ROOT) {
  let total = 0;
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== "snapshots" && entry.name !== "checkpoint") walk(p); continue; }
      if (entry.name !== "provenance.json") continue;
      let prov = null;
      try { prov = JSON.parse(fs.readFileSync(p, "utf8")); } catch { continue; }
      if (prov && typeof prov.totalCostUsd === "number") { total += prov.totalCostUsd; continue; }
      // A run that died: its last progress.json has the running cost.
      try {
        const progress = JSON.parse(fs.readFileSync(path.join(dir, "progress.json"), "utf8"));
        if (typeof progress.costUsd === "number") total += progress.costUsd;
      } catch { /* nothing recorded */ }
    }
  };
  walk(root);
  return total;
}

function runOne({ domain, runId, blockDir, env, log }) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["tests/evals/run-multi-domain-benchmark.mjs", `--domain=${domain}`, `--run=${runId}`, `--resultsDir=${blockDir}`], {
      cwd: ROOT, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"],
    });
    const forward = (stream) => {
      let buf = "";
      stream.on("data", (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf("\n")) >= 0) { log(buf.slice(0, i)); buf = buf.slice(i + 1); }
      });
      stream.on("end", () => { if (buf) log(buf); });
    };
    forward(child.stdout);
    forward(child.stderr);
    child.on("close", (code) => resolve(code));
  });
}

async function main() {
  const arg = (name, fallback) => {
    const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split("=").slice(1).join("=") : fallback;
  };
  const block = BLOCKS[arg("block", "")];
  if (!block) { console.error("Usage: node tests/evals/run-paired-stages.mjs --block=1|2 [--runs=domain:run-id,...] [--budget=USD]"); process.exit(1); }
  const runs = arg("runs", DEFAULT_RUNS.join(",")).split(",").map((s) => s.split(":"));
  const budget = Number(arg("budget", "200"));
  const blockDir = path.join(RESULTS_ROOT, block.dir);
  fs.mkdirSync(blockDir, { recursive: true });
  const logPath = path.join(blockDir, "block.log");
  const log = (line) => {
    const stamped = `${new Date().toISOString()} ${line}`;
    console.log(stamped);
    fs.appendFileSync(logPath, `${stamped}\n`);
  };
  const env = protocolEnv(block.effort);

  for (const [domain, runId] of runs) {
    const spent = spentUsd();
    if (spent >= budget) { log(`STOP: $${spent.toFixed(2)} spent across paired-stages/, budget $${budget} reached`); process.exitCode = 4; return; }
    log(`START ${block.dir} ${domain}/${runId} (spent so far $${spent.toFixed(2)} of $${budget})`);
    const code = await runOne({ domain, runId, blockDir, env, log });
    const prov = (() => { try { return JSON.parse(fs.readFileSync(path.join(blockDir, runId, domain, "provenance.json"), "utf8")); } catch { return null; } })();
    const clean = code === 0 && prov && prov.status === "complete" && prov.stoppedReason === "stages_complete";
    log(`END ${domain}/${runId}: exit=${code} status=${prov && prov.status} stopped=${prov && prov.stoppedReason} `
      + `cost=$${prov && typeof prov.totalCostUsd === "number" ? prov.totalCostUsd.toFixed(2) : "?"} turns=${prov && prov.turnsUsed}`);
    if (!clean) { log(`STOP: ${domain}/${runId} did not end cleanly; not starting another run`); process.exitCode = 5; return; }
  }
  log(`BLOCK DONE ${block.dir}: $${spentUsd().toFixed(2)} spent across paired-stages/`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
