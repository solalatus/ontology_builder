import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { withPage } from "./lib/page.mjs";

// Proves the JS importer (index.html's parseTxtImport) and the standalone
// Python reference loader (tools/load_edge_list.py, itself kept in sync
// with spec.md's Appendix by hand) agree on every shared fixture — the
// strongest available evidence that all three are actually in one
// consistent state, not just asserted to be by comment.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const fixturesDir = path.join(__dirname, "fixtures");
const loaderScript = path.join(repoRoot, "tools", "load_edge_list.py");

function pythonAvailable() {
  const result = spawnSync("python3", ["--version"]);
  return result.status === 0;
}

function runPythonLoader(fixturePath) {
  const out = execFileSync("python3", [loaderScript, fixturePath], { encoding: "utf-8" });
  return JSON.parse(out);
}

// Normalizes JS edge objects {source,target,relation,directed} (labels
// already, matching Python's output shape) for order-independent comparison.
function sortedEdges(edges) {
  return edges
    .map((e) => ({ source: e.source, target: e.target, relation: e.relation, directed: e.directed }))
    .sort((a, b) => (a.source + a.target + a.relation).localeCompare(b.source + b.target + b.relation));
}
function sortedNodes(nodes) {
  return [...nodes].sort((a, b) => (a.label + a.type).localeCompare(b.label + b.type));
}

const fixtures = fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".txt"));

for (const fixtureName of fixtures) {
  test(`JS and Python parsers agree on fixtures/${fixtureName}`, async () => {
    if (!pythonAvailable()) {
      console.warn("[python-parity] python3 not found on PATH — skipping (environment-dependent, see tests/README.md)");
      return;
    }
    const fixturePath = path.join(fixturesDir, fixtureName);
    const text = fs.readFileSync(fixturePath, "utf-8");

    const pyResult = runPythonLoader(fixturePath);

    await withPage(async (page) => {
      const jsResult = await page.evaluate((t) => window.parseTxtImport(t), text);
      assert.deepEqual(sortedNodes(jsResult.nodes), sortedNodes(pyResult.nodes),
        `node lists differ for ${fixtureName}`);
      assert.deepEqual(sortedEdges(jsResult.edges), sortedEdges(pyResult.edges),
        `edge lists differ for ${fixtureName}`);
    });
  });
}
