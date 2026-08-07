#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Layout-quality bench for the issue #64 ("Crowded graph layout") experiments.
//
// Dev-only tooling, same spirit as tests/ (spec.md's "shipped app has zero
// runtime dependencies" is unaffected — nothing here is loaded by index.html
// itself). For each fixture in tests/fixtures/, this: opens index.html in a
// headless browser, imports the fixture YAML (merge, on an empty canvas —
// commitYamlImport already runs one internal autolayout pass), clicks the
// Auto-layout toolbar button for an explicit second pass (matching the
// literal "import, then Auto-layout" workflow), fits the camera to the
// resulting graph, and records a screenshot plus quantitative layout-quality
// metrics computed directly from window.__kg.state.
//
// Usage: node tools/layout-bench.mjs <label> [fixture-basename ...]
//   <label> names this run's output subfolder under layout-bench-out/
//   (e.g. "baseline", "iter1-size-aware-repulsion"). With no fixture names,
//   runs all fixtures in tests/fixtures/*.domain.yaml.
// ---------------------------------------------------------------------------
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { withPage } from "../tests/lib/page.mjs";
import { computeLayoutMetrics, extractStateForMetrics } from "../tests/lib/layout-metrics.mjs";
import { FIXTURES_DIR, defaultFixtures, setTheme, importAndLayout } from "../tests/lib/layout-fixtures.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "layout-bench-out");

// No built-in "fit to view" in the app (it's a hand-panned canvas) -- this
// mirrors worldToScreen's own scale/pan formula (index.html's screenToWorld/
// worldToScreen) in reverse, computed from the current node bounding box, so
// the whole graph is framed for the screenshot regardless of graph size.
async function fitCameraToNodes(page, padding = 60) {
  await page.evaluate((padding) => {
    const { state, camera } = window.__kg;
    if (state.nodes.length === 0) return;
    const minX = Math.min(...state.nodes.map((n) => n.x));
    const maxX = Math.max(...state.nodes.map((n) => n.x + n.w));
    const minY = Math.min(...state.nodes.map((n) => n.y));
    const maxY = Math.max(...state.nodes.map((n) => n.y + n.h));
    const boxW = Math.max(1, maxX - minX), boxH = Math.max(1, maxY - minY);
    const canvas = document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    const availW = rect.width - 2 * padding, availH = rect.height - 2 * padding;
    const scale = Math.max(0.02, Math.min(availW / boxW, availH / boxH, 3));
    camera.scale = scale;
    camera.panX = padding - minX * scale + (availW - boxW * scale) / 2;
    camera.panY = padding - minY * scale + (availH - boxH * scale) / 2;
    window.__kg.markDirty();
    window.__kg.render();
  }, padding);
}

async function runOne(fixtureName, label) {
  const fixturePath = path.join(FIXTURES_DIR, fixtureName);
  const fixtureKey = fixtureName.replace(/\.domain\.yaml$/, "");
  const outDir = path.join(OUT_DIR, fixtureKey);
  fs.mkdirSync(outDir, { recursive: true });

  let metrics;
  await withPage(async (page) => {
    await setTheme(page, "light");
    await importAndLayout(page, fixturePath);
    await fitCameraToNodes(page);
    await page.waitForTimeout(50);
    const { nodes, edges } = await page.evaluate(extractStateForMetrics);
    metrics = computeLayoutMetrics(nodes, edges);
    await page.screenshot({ path: path.join(outDir, `${label}.png`) });
  });

  fs.writeFileSync(
    path.join(outDir, `${label}.json`),
    JSON.stringify({ fixture: fixtureName, label, ...metrics }, null, 2),
  );
  return metrics;
}

async function main() {
  const [label, ...requested] = process.argv.slice(2);
  if (!label) {
    console.error("Usage: node tools/layout-bench.mjs <label> [fixture-basename ...]");
    process.exit(1);
  }
  const fixtures = requested.length ? requested : defaultFixtures();
  const summary = {};
  for (const fx of fixtures) {
    process.stdout.write(`[layout-bench] ${label} :: ${fx} ... `);
    const metrics = await runOne(fx, label);
    console.log("done");
    console.log(JSON.stringify(metrics, null, 2));
    summary[fx] = metrics;
  }
  const summaryPath = path.join(OUT_DIR, `${label}.summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n[layout-bench] wrote ${summaryPath}`);
}

// Guarded so zoom-check.mjs (and anything else) can import the helpers
// above without also re-running this file's own CLI entry point.
if (import.meta.url === `file://${process.argv[1]}`) main();
