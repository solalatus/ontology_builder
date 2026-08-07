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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "..", "tests", "fixtures");
const OUT_DIR = path.resolve(__dirname, "layout-bench-out");

function defaultFixtures() {
  return fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".domain.yaml")).sort();
}

async function importAndLayout(page, fixturePath) {
  await page.setInputFiles("#import-file-input", fixturePath);
  await page.waitForSelector("#import-overlay", { state: "visible" });
  await page.click("#import-merge");
  await page.waitForFunction(() => window.__kg.history.past.length >= 1);
  await page.click("#btn-autolayout");
  await page.waitForFunction(() => window.__kg.history.past.length >= 2);
}

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

function rectOverlapArea(a, b) {
  const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

function orient(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function onSegment(ax, ay, bx, by, px, py) {
  return Math.min(ax, bx) - 1e-9 <= px && px <= Math.max(ax, bx) + 1e-9 &&
    Math.min(ay, by) - 1e-9 <= py && py <= Math.max(ay, by) + 1e-9;
}

// Standard orientation-based segment intersection (proper + collinear
// touching cases). Endpoints are node *centers*, not the app's actual
// border-anchored edge geometry (index.html's edgeAnchors/edgeGeometry) --
// a deliberate simplification so this metric is cheap and, more importantly,
// applied identically to every algorithm version being compared. It's a
// relative signal across iterations on the same fixture, not a claim about
// the exact pixel-level crossing count a user would see.
function segmentsIntersect(a1, a2, b1, b2) {
  const d1 = orient(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y);
  const d2 = orient(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y);
  const d3 = orient(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y);
  const d4 = orient(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  if (d1 === 0 && onSegment(b1.x, b1.y, b2.x, b2.y, a1.x, a1.y)) return true;
  if (d2 === 0 && onSegment(b1.x, b1.y, b2.x, b2.y, a2.x, a2.y)) return true;
  if (d3 === 0 && onSegment(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y)) return true;
  if (d4 === 0 && onSegment(a1.x, a1.y, a2.x, a2.y, b2.x, b2.y)) return true;
  return false;
}

function mean(xs) { return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0; }
function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function computeMetrics(nodes, edges) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const center = (n) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

  // Node-box overlap
  let overlapPairs = 0, overlapArea = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = rectOverlapArea(nodes[i], nodes[j]);
      if (a > 0) { overlapPairs++; overlapArea += a; }
    }
  }

  // Edge-crossing count (center-to-center proxy, see segmentsIntersect note)
  const segs = edges
    .map((e) => ({ e, a: byId.get(e.source), b: byId.get(e.target) }))
    .filter((s) => s.a && s.b);
  let crossings = 0;
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      const s1 = segs[i], s2 = segs[j];
      const sharesEndpoint = [s1.e.source, s1.e.target].some((id) => id === s2.e.source || id === s2.e.target);
      if (sharesEndpoint) continue;
      if (segmentsIntersect(center(s1.a), center(s1.b), center(s2.a), center(s2.b))) crossings++;
    }
  }

  // Edge length stats (center-to-center)
  const lengths = segs.map((s) => Math.hypot(center(s.a).x - center(s.b).x, center(s.a).y - center(s.b).y));

  // Bounding box / density
  const minX = Math.min(...nodes.map((n) => n.x)), maxX = Math.max(...nodes.map((n) => n.x + n.w));
  const minY = Math.min(...nodes.map((n) => n.y)), maxY = Math.max(...nodes.map((n) => n.y + n.h));
  const bboxW = maxX - minX, bboxH = maxY - minY, bboxArea = bboxW * bboxH;
  const totalNodeArea = nodes.reduce((s, n) => s + n.w * n.h, 0);

  // Edge-label collision proxy: label sits at segment midpoint
  // (index.html's edgeGeometry, unbent case) offset ~4px above the line --
  // close enough for a midpoint-based collision proxy. A collision is either
  // two edge-label points within LABEL_MIN_DIST of each other, or a label
  // point landing inside a third node's box (not one of that edge's own
  // endpoints).
  const LABEL_MIN_DIST = 40;
  const mids = segs.map((s) => ({ x: (center(s.a).x + center(s.b).x) / 2, y: (center(s.a).y + center(s.b).y) / 2 }));
  let labelLabelCollisions = 0;
  for (let i = 0; i < mids.length; i++) {
    for (let j = i + 1; j < mids.length; j++) {
      if (Math.hypot(mids[i].x - mids[j].x, mids[i].y - mids[j].y) < LABEL_MIN_DIST) labelLabelCollisions++;
    }
  }
  let labelNodeCollisions = 0;
  for (let i = 0; i < mids.length; i++) {
    const { e } = segs[i];
    for (const n of nodes) {
      if (n.id === e.source || n.id === e.target) continue;
      if (mids[i].x >= n.x && mids[i].x <= n.x + n.w && mids[i].y >= n.y && mids[i].y <= n.y + n.h) labelNodeCollisions++;
    }
  }

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodeOverlap: { pairs: overlapPairs, totalArea: Math.round(overlapArea) },
    edgeCrossings: crossings,
    edgeLength: {
      mean: Math.round(mean(lengths)), stdev: Math.round(stdev(lengths)),
      min: lengths.length ? Math.round(Math.min(...lengths)) : 0,
      max: lengths.length ? Math.round(Math.max(...lengths)) : 0,
    },
    boundingBox: { w: Math.round(bboxW), h: Math.round(bboxH), area: Math.round(bboxArea) },
    density: bboxArea > 0 ? Number((totalNodeArea / bboxArea).toFixed(4)) : null,
    labelCollisions: { labelLabel: labelLabelCollisions, labelNode: labelNodeCollisions },
  };
}

async function runOne(fixtureName, label) {
  const fixturePath = path.join(FIXTURES_DIR, fixtureName);
  const fixtureKey = fixtureName.replace(/\.domain\.yaml$/, "");
  const outDir = path.join(OUT_DIR, fixtureKey);
  fs.mkdirSync(outDir, { recursive: true });

  let metrics;
  await withPage(async (page) => {
    await importAndLayout(page, fixturePath);
    await fitCameraToNodes(page);
    await page.waitForTimeout(50);
    const { nodes, edges } = await page.evaluate(() => ({
      nodes: window.__kg.state.nodes.map(({ id, x, y, w, h, label }) => ({ id, x, y, w, h, label })),
      edges: window.__kg.state.edges.map(({ id, source, target, relation }) => ({ id, source, target, relation })),
    }));
    metrics = computeMetrics(nodes, edges);
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

main();
