import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { withPage } from "./lib/page.mjs";
import { FIXTURES_DIR, importAndLayout } from "./lib/layout-fixtures.mjs";
import { computeLayoutMetrics, extractStateForMetrics } from "./lib/layout-metrics.mjs";

// Permanent regression guards for the issue #64 ("Crowded graph layout")
// autolayout work, promoted from the exploratory tools/layout-bench.mjs
// bench used to drive that work's iterations. Deliberately synthetic-only
// fixtures (tests/fixtures/synthetic-*.domain.yaml) -- nothing in this repo
// depends on any external ontology being present; see those fixtures'
// own headers for what shape of graph each one stresses.
//
// Two kinds of assertion per fixture:
//   - node-box overlap must be exactly zero, unconditionally (iteration 1's
//     resolveNodeOverlaps guarantee -- this is a hard invariant, not a
//     "budget", and any regression here is a real bug).
//   - edge crossings and label collisions are asserted against a captured
//     baseline (the actual current value, from a real bench run recorded
//     in each case below) using <=, not ===: a future iteration that
//     legitimately improves on these numbers doesn't need this file
//     touched, but any regression above the recorded baseline fails loudly.
//     Bump the baseline down (never up without investigating why) when a
//     real improvement lands.
const CASES = [
  {
    file: "synthetic-sparse-tree.domain.yaml",
    label: "sparse tree (12 nodes / 11 edges)",
    maxCrossings: 0,
    maxLabelCollisions: 0,
  },
  {
    file: "synthetic-dense-hubs.domain.yaml",
    label: "dense hub-and-spoke (20 nodes / 29 edges)",
    maxCrossings: 5,
    maxLabelCollisions: 0,
  },
  {
    file: "synthetic-medium-mesh.domain.yaml",
    label: "medium mixed hub/leaf mesh (36 nodes / 46 edges)",
    maxCrossings: 6,
    // Iteration 4's label-declutter pass is a bounded, best-effort nudge,
    // not a hard guarantee like node-overlap removal -- this fixture is
    // the one case among the three where it doesn't fully clear every
    // collision (1 remains). Recorded here rather than silently ignored.
    maxLabelCollisions: 1,
  },
];

for (const { file, label, maxCrossings, maxLabelCollisions } of CASES) {
  test(`autolayout quality regression guard: ${label}`, async () => {
    await withPage(async (page) => {
      const start = Date.now();
      await importAndLayout(page, path.join(FIXTURES_DIR, file));
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 10000, `import + autolayout should complete quickly, took ${elapsed}ms`);

      const { nodes, edges } = await page.evaluate(extractStateForMetrics);
      const metrics = computeLayoutMetrics(nodes, edges);

      assert.equal(
        metrics.nodeOverlap.pairs, 0,
        `no node-box overlap pairs should exist after autolayout (got ${metrics.nodeOverlap.pairs}, area ${metrics.nodeOverlap.totalArea})`,
      );
      assert.ok(
        metrics.edgeCrossings <= maxCrossings,
        `edge crossings regressed: ${metrics.edgeCrossings} > baseline ${maxCrossings}`,
      );
      const totalLabelCollisions = metrics.labelCollisions.labelLabel + metrics.labelCollisions.labelNode;
      assert.ok(
        totalLabelCollisions <= maxLabelCollisions,
        `label collisions regressed: ${totalLabelCollisions} (label-label ${metrics.labelCollisions.labelLabel}, ` +
        `label-node ${metrics.labelCollisions.labelNode}) > baseline ${maxLabelCollisions}`,
      );
    });
  });
}

test("autolayout is deterministic — running it twice on the same imported graph gives byte-identical positions", async () => {
  // Not a quality guard, but a load-bearing assumption every guard above
  // relies on: the whole point of computeAutoLayoutPositions() staying
  // free of RNG (index.html's own design note on the function) is that a
  // bench/regression run is reproducible. Re-clicking Auto-layout with no
  // graph change in between should settle at exactly the same positions.
  await withPage(async (page) => {
    // importAndLayout leaves exactly 2 history entries (commitYamlImport's
    // own internal pass, then the explicit toolbar click) -- re-clicking
    // Auto-layout here should add exactly one more, with no graph change
    // in between to justify a different result.
    await importAndLayout(page, path.join(FIXTURES_DIR, "synthetic-dense-hubs.domain.yaml"));
    const first = await page.evaluate(() => window.__kg.state.nodes.map(({ id, x, y }) => ({ id, x, y })));

    await page.click("#btn-autolayout");
    await page.waitForFunction(() => window.__kg.history.past.length >= 3);
    const second = await page.evaluate(() => window.__kg.state.nodes.map(({ id, x, y }) => ({ id, x, y })));

    assert.deepEqual(second, first, "re-running Auto-layout on an unchanged graph should be idempotent");
  });
});
