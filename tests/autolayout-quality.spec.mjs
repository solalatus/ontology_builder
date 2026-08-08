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
//   - node-box overlap must be exactly zero (iteration 1's
//     resolveNodeOverlaps guarantee) at every fixture size in this file --
//     any regression here is a real bug. Not literally unconditional at
//     every possible graph size, though: resolveNodeOverlaps is bounded to
//     OVERLAP_PASS_MAX_ITERATIONS (a fixed cost/hang tradeoff, not a
//     convergence guarantee), and the "autolayout at 500 nodes" stress test
//     below documents exactly where that stops holding in practice (zero
//     overlaps confirmed at 500 nodes; dozens of residual pairs at 1,000) --
//     see that test's own comment and TODO.md for the open scaling question.
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

test("a small first import doesn't collapse into a straight line", async () => {
  // computeImportShelf() places fresh imports into an empty canvas in rows
  // of 5, so any import of <=5 nodes hands computeAutoLayoutPositions() a
  // perfectly collinear "today's positions" seed. Pairwise force relaxation
  // can never introduce a missing axis on its own (every force vector stays
  // exactly parallel to the seed's one axis of variation), so before
  // relaxCenters()'s symmetry-breaking fix, a graph exactly this shape --
  // small, with a cycle so it isn't naturally 1-dimensional -- relaxed to
  // every node sharing the exact same y coordinate, no matter how the
  // graph's own topology was shaped.
  await withPage(async (page) => {
    const yaml = [
      "classes:",
      "  Person: {meaning: A}",
      "  Organization: {meaning: B}",
      "  Project: {meaning: C}",
      "  Task: {meaning: D}",
      "  Document: {meaning: E}",
      "relationships:",
      "  - {from: Person, to: Organization, name: worksFor}",
      "  - {from: Person, to: Project, name: contributesTo}",
      "  - {from: Project, to: Task, name: hasTask}",
      "  - {from: Task, to: Person, name: assignedTo}",
      "  - {from: Person, to: Document, name: authored}",
    ].join("\n");
    await page.evaluate((t) => {
      const dt = new DataTransfer();
      const file = new File([t], "small.yaml", { type: "text/plain" });
      dt.items.add(file);
      document.getElementById("canvas").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, yaml);
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.click("#import-merge");
    await page.waitForFunction(() => window.__kg.state.nodes.length === 5);

    const ys = await page.evaluate(() => window.__kg.state.nodes.map((n) => n.y));
    const spread = Math.max(...ys) - Math.min(...ys);
    assert.ok(spread > 50, `expected real 2D spread on the y axis, got a ${spread}px range (${JSON.stringify(ys)})`);
  });
});

test("import and Auto-layout both leave every node visible on screen, not just well laid out", async () => {
  // A correct layout is not enough if the camera never moves to find it:
  // the camera starts at (and, without this, never leaves) panX:0/panY:0/
  // scale:1, so a relaxed layout whose bounding box exceeds one screen (a
  // near-certainty for a real-sized ontology, per issue #64's own "many
  // relationships are hidden" complaint) leaves nodes genuinely off-screen.
  await withPage(async (page) => {
    await importAndLayout(page, path.join(FIXTURES_DIR, "synthetic-medium-mesh.domain.yaml"));

    const canvasSize = await page.evaluate(() => {
      const c = document.getElementById("canvas");
      return { w: c.clientWidth, h: c.clientHeight };
    });
    const offscreen = await page.evaluate(({ w, h }) => {
      return window.__kg.state.nodes.filter((n) => {
        const p = window.__kg.worldToScreen(n.x + n.w / 2, n.y + n.h / 2);
        return p.x < 0 || p.y < 0 || p.x > w || p.y > h;
      }).length;
    }, canvasSize);
    assert.equal(offscreen, 0, `expected every node's center on screen after import+layout, got ${offscreen} off-screen`);
  });
});

test("autolayout at 500 nodes: zero overlaps, completes within a real time budget", async () => {
  // The permanent suite above tops out at 36 nodes -- nothing previously
  // confirmed behavior anywhere near index.html's own stated ~1,000-node
  // target (see computeAutoLayoutPositions's neighboring comments), despite
  // that being exactly the scale issue #64 is about. Measured directly: at
  // 500 nodes/~750 edges this settles with zero overlaps in ~15s; at 1,000
  // nodes the overlap-resolution pass (bounded to
  // OVERLAP_PASS_MAX_ITERATIONS, a fixed cost/hang tradeoff, not a
  // convergence guarantee) leaves dozens of pairs still touching, and the
  // whole pass takes ~40s of unyielded main-thread time. That's a real,
  // currently-open scaling ceiling somewhere between 500 and 1,000 nodes --
  // tracked in TODO.md rather than silently asserted away here. This test
  // pins the size where the app's own "overlap is a hard invariant, not a
  // budget" claim (see this file's header comment) is actually still true,
  // so a future change that narrows that ceiling further fails loudly.
  await withPage(async (page) => {
    const n = 500;
    const start = Date.now();
    await page.evaluate((n) => {
      for (let i = 0; i < n; i++) {
        window.__kg.actions.createNode((i % 40) * 90, Math.floor(i / 40) * 60, "Node" + i);
      }
      const nodes = window.__kg.state.nodes;
      // Deterministic pseudo-scatter of edges (same formula shape as
      // phase6.spec.mjs's own 200-node stress test), not Math.random(), so
      // this test is reproducible.
      for (let i = 0; i < n * 1.5; i++) {
        const a = nodes[i % n];
        const b = nodes[(i * 37 + 11) % n];
        if (a.id !== b.id) window.__kg.actions.createEdge(a.id, b.id, "r" + i, true);
      }
      window.__kg.actions.autoLayout();
    }, n);
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 45000, `500-node autolayout took ${elapsed}ms, expected well under 45s`);

    const overlaps = await page.evaluate(() => {
      const nodes = window.__kg.state.nodes;
      let count = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) count++;
        }
      }
      return count;
    });
    assert.equal(overlaps, 0, `expected zero node-box overlaps at 500 nodes, got ${overlaps}`);
  });
});
