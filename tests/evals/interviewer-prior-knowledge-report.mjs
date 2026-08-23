// INTERVIEWER PRIOR-KNOWLEDGE REPORT (issue #137, follow-up to #133/#136)
//
//   node tests/evals/interviewer-prior-knowledge-report.mjs \
//     --domains=brick-hvac,iof-maintenance,iof-supply-chain,fibo-loans \
//     --runs=run-01,run-02,run-03
//
//   node tests/evals/interviewer-prior-knowledge-report.mjs \
//     --domains=itops --runs=run-01,run-02,run-03 \
//     --resultsDir=ontology_translation/results/multi-domain-control
//
// No API calls -- pure offline replay over each run's own committed
// conversation-log.md, heuristic-matches.json, and recovered-model.yaml
// (mirrors rescore-saved-run.mjs's own "re-derive from persisted artifacts"
// discipline). For each domain x replicate, computes which raw multi-segment
// gold identifiers were introduced first by the INTERVIEWER rather than the
// persona -- the channel #133's Finding A explicitly scoped out of its own
// leak audit and PR #136's post-close audit first quantified ad hoc on the
// 12-run re-run (330 total, 162 matched) -- plus how many of those ended up
// as a scored heuristic match. See tests/evals/lib/interviewerPriorKnowledge.mjs
// for exactly what "first" and "matched" mean and their documented
// approximations (property/relationship cross-referencing is existential,
// not instance-specific).
//
// Also re-verifies the persona side stays clean (personaFirst should be
// empty on any run built with #133's leak guard active) as a cheap sanity
// check that comes for free from the same first-speaker computation.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { resolveDomainYamlPath, resolveDomainPersonaPath, loadGroundTruthModel } from "./lib/groundTruthModel.mjs";
import { collectMultiSegmentIdentifiers } from "./lib/leakDetector.mjs";
import { parseConversationLog } from "./lib/reportGenerator.mjs";
import { recoveredStateFromYaml } from "./score-baseline.mjs";
import { computeFirstSpeakerIdentifiers, crossReferenceMatchedIdentifiers } from "./lib/interviewerPriorKnowledge.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_RESULTS_ROOT = path.join(REPO_ROOT, "ontology_translation", "results", "multi-domain");

const arg = (name, fallback = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const csvList = (name) => {
  const v = arg(name);
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
};

function analyzeRun(domain, runId, resultsRoot) {
  const dir = path.join(resultsRoot, runId, domain);
  const logPath = path.join(dir, "conversation-log.md");
  const matchesPath = path.join(dir, "heuristic-matches.json");
  const modelPath = path.join(dir, "recovered-model.yaml");
  if (!fs.existsSync(logPath) || !fs.existsSync(matchesPath) || !fs.existsSync(modelPath)) return null;

  const domainYamlPath = resolveDomainYamlPath(domain);
  const domainYamlDoc = yaml.load(fs.readFileSync(domainYamlPath, "utf8"));
  const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: domainYamlPath });
  const candidateSet = collectMultiSegmentIdentifiers(domainYamlDoc);

  const entries = parseConversationLog(fs.readFileSync(logPath, "utf8"));
  const { interviewerFirst, personaFirst } = computeFirstSpeakerIdentifiers(entries, candidateSet);

  const heuristicMatches = JSON.parse(fs.readFileSync(matchesPath, "utf8"));
  const { state: recoveredState } = recoveredStateFromYaml(fs.readFileSync(modelPath, "utf8"));
  const matchedInterviewerFirst = crossReferenceMatchedIdentifiers({
    identifiers: interviewerFirst, domainYamlDoc, groundTruth, recoveredState, heuristicMatches,
  });

  return {
    domain, runId,
    interviewerFirstCount: interviewerFirst.size,
    interviewerFirstMatchedCount: matchedInterviewerFirst.size,
    personaFirstCount: personaFirst.size,
    personaFirstIdentifiers: [...personaFirst],
  };
}

async function main() {
  const domains = csvList("domains");
  const runs = csvList("runs");
  if (domains.length === 0 || runs.length === 0) {
    console.error("Usage: node tests/evals/interviewer-prior-knowledge-report.mjs --domains=<d1,d2,...> --runs=<r1,r2,...> [--resultsDir=<path>]");
    process.exit(1);
  }
  const resultsRoot = path.resolve(process.cwd(), arg("resultsDir", DEFAULT_RESULTS_ROOT));

  const rows = [];
  const missing = [];
  for (const domain of domains) {
    for (const runId of runs) {
      const row = analyzeRun(domain, runId, resultsRoot);
      if (!row) { missing.push(`${domain}/${runId}`); continue; }
      rows.push(row);
    }
  }
  if (missing.length) {
    console.error(`Skipped (no completed run found): ${missing.join(", ")}`);
  }
  if (rows.length === 0) {
    console.error("No completed runs found -- nothing to analyze.");
    process.exit(1);
  }

  console.log("domain/run | interviewer-first (matched) | persona-first");
  console.log("-----------|------------------------------|---------------");
  let totalInterviewerFirst = 0;
  let totalInterviewerFirstMatched = 0;
  let totalPersonaFirst = 0;
  const anyPersonaLeak = [];
  for (const r of rows) {
    console.log(`${r.domain}/${r.runId} | ${r.interviewerFirstCount} (${r.interviewerFirstMatchedCount}) | ${r.personaFirstCount}`);
    totalInterviewerFirst += r.interviewerFirstCount;
    totalInterviewerFirstMatched += r.interviewerFirstMatchedCount;
    totalPersonaFirst += r.personaFirstCount;
    if (r.personaFirstCount > 0) anyPersonaLeak.push(`${r.domain}/${r.runId}: ${r.personaFirstIdentifiers.join(", ")}`);
  }
  const range = rows.map((r) => r.interviewerFirstCount);
  console.log("");
  console.log(`TOTAL across ${rows.length} run(s): interviewer-first = ${totalInterviewerFirst} `
    + `(range ${Math.min(...range)}-${Math.max(...range)}/run), of which ${totalInterviewerFirstMatched} ended up as a scored match `
    + `(${totalInterviewerFirst ? ((100 * totalInterviewerFirstMatched) / totalInterviewerFirst).toFixed(0) : 0}%). `
    + `persona-first (leak guard should keep this at 0) = ${totalPersonaFirst}.`);
  if (anyPersonaLeak.length) {
    console.log(`WARNING -- persona-first identifiers found (leak guard should have caught these live):\n  ${anyPersonaLeak.join("\n  ")}`);
  }

  const outPath = arg("out");
  if (outPath) {
    fs.writeFileSync(path.resolve(process.cwd(), outPath), `${JSON.stringify({
      generatedAt: new Date().toISOString(), resultsRoot, rows,
      totals: { totalInterviewerFirst, totalInterviewerFirstMatched, totalPersonaFirst },
    }, null, 2)}\n`);
    console.log(`Wrote ${outPath}`);
  }
}

await main();
