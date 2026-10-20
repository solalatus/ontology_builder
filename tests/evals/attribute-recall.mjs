// PER-ITEM RECALL ATTRIBUTION (issue #182), offline, no model calls.
//
//   node tests/evals/attribute-recall.mjs --domain=<id> [--write] <run-dir> [...]
//
// For a paired-stage run (snapshots/<label>/ present) every snapshot is
// attributed at its own turn, and the moves from A to C are listed; for an
// older run, the final model is attributed at the last turn. --write saves
// attribution.json in each run directory. See lib/recallAttribution.mjs for
// the categories and how each is decided.
import fs from "node:fs";
import path from "node:path";
import { loadGroundTruthModel, resolveDomainYamlPath } from "./lib/groundTruthModel.mjs";
import { parseConversationLog } from "./lib/reportGenerator.mjs";
import { attributeSnapshot, parseAppliedYaml, attributionTransitions } from "./lib/recallAttribution.mjs";

const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);
const readJsonIf = (p) => { const t = readIf(p); return t ? JSON.parse(t) : null; };

export function attributeRun(runDir, domain) {
  const groundTruth = loadGroundTruthModel({ format: "domain-yaml", path: resolveDomainYamlPath(domain) });
  const log = parseConversationLog(readIf(path.join(runDir, "conversation-log.md")) || "");
  const applied = parseAppliedYaml(readIf(path.join(runDir, "tool-calls.md")) || "");
  const snapshotsDir = path.join(runDir, "snapshots");
  const labels = fs.existsSync(snapshotsDir) ? fs.readdirSync(snapshotsDir).filter((l) => fs.existsSync(path.join(snapshotsDir, l, "recovered-model.yaml"))).sort() : [];
  const targets = labels.length
    ? labels.map((label) => ({ label, dir: path.join(snapshotsDir, label), turn: (readJsonIf(path.join(snapshotsDir, label, "snapshot.json")) || {}).turn ?? Infinity }))
    : [{ label: "final", dir: runDir, turn: Infinity }];
  const snapshots = {};
  for (const t of targets) {
    snapshots[t.label] = attributeSnapshot({
      groundTruth, log, applied, turn: t.turn,
      snapshotYaml: fs.readFileSync(path.join(t.dir, "recovered-model.yaml"), "utf8"),
      semanticMatches: readJsonIf(path.join(t.dir, "semantic-matches.json")),
    });
  }
  const out = { runDir, domain, snapshots };
  if (snapshots.A && snapshots.C) out.transitionsAtoC = attributionTransitions(snapshots.A, snapshots.C);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const domainArg = args.find((a) => a.startsWith("--domain="));
  const write = args.includes("--write");
  const dirs = args.filter((a) => !a.startsWith("--"));
  if (!domainArg || !dirs.length) {
    console.error("Usage: node tests/evals/attribute-recall.mjs --domain=<id> [--write] <run-dir> [...]");
    process.exit(1);
  }
  const domain = domainArg.split("=").slice(1).join("=");
  for (const dir of dirs) {
    const runDir = path.resolve(process.cwd(), dir);
    const result = attributeRun(runDir, domain);
    console.log(`\n${path.relative(process.cwd(), runDir)}`);
    console.log("snapshot  dimension      recovered  endpoint_missing  other_name  removed  mentioned  never  gold");
    for (const [label, snap] of Object.entries(result.snapshots)) {
      for (const dim of ["classes", "relationships", "properties"]) {
        const c = snap.counts[dim];
        console.log(`${label.padEnd(9)} ${dim.padEnd(14)} ${String(c.recovered).padStart(9)}  ${String(c.endpoint_class_missing).padStart(16)}  ${String(c.other_name).padStart(10)}  `
          + `${String(c.removed).padStart(7)}  ${String(c.mentioned_not_committed).padStart(9)}  ${String(c.never_mentioned).padStart(5)}  ${String(c.goldTotal).padStart(4)}`);
      }
    }
    if (result.transitionsAtoC) console.log(`A -> C moves: ${JSON.stringify(result.transitionsAtoC)}`);
    if (write) fs.writeFileSync(path.join(runDir, "attribution.json"), `${JSON.stringify(result, null, 2)}\n`);
  }
}
