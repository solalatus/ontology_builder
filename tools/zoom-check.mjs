#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Multi-zoom visual QA for issue #64 iteration 3 (zoom-aware label sizing,
// see index.html's effectiveFontSize()). layout-bench.mjs's screenshots are
// all taken at a single "fit the whole graph" overview zoom — this script
// instead captures the SAME laid-out graph at several distinct zoom levels
// (overview, a normal ~1:1 working zoom, and a close-up on the busiest hub
// node), so a font-size change that only affects the overview end of the
// range can be checked at the other end too, not just assumed unaffected.
//
// Usage: node tools/zoom-check.mjs <label> [fixture-basename ...]
// ---------------------------------------------------------------------------
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { withPage } from "../tests/lib/page.mjs";
import { importAndLayout, setTheme, defaultFixtures, FIXTURES_DIR } from "./layout-bench.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "layout-bench-out");

async function setCamera(page, { scale, centerOn }) {
  await page.evaluate(({ scale, centerOn }) => {
    const { state, camera } = window.__kg;
    const canvas = document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    let cx, cy;
    if (centerOn === "graph") {
      const minX = Math.min(...state.nodes.map((n) => n.x)), maxX = Math.max(...state.nodes.map((n) => n.x + n.w));
      const minY = Math.min(...state.nodes.map((n) => n.y)), maxY = Math.max(...state.nodes.map((n) => n.y + n.h));
      cx = (minX + maxX) / 2; cy = (minY + maxY) / 2;
    } else if (centerOn === "busiest") {
      const degree = new Map();
      for (const e of state.edges) {
        degree.set(e.source, (degree.get(e.source) || 0) + 1);
        degree.set(e.target, (degree.get(e.target) || 0) + 1);
      }
      const busiest = [...state.nodes].sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0))[0];
      cx = busiest.x + busiest.w / 2; cy = busiest.y + busiest.h / 2;
    }
    camera.scale = scale;
    camera.panX = rect.width / 2 - cx * scale;
    camera.panY = rect.height / 2 - cy * scale;
    window.__kg.markDirty();
    window.__kg.render();
  }, { scale, centerOn });
}

// Overview: same "fit whole graph" logic as layout-bench.mjs's
// fitCameraToNodes, duplicated here (rather than imported) since it needs
// the *actual* fitted scale value back, not just to apply it, so the caller
// can log what zoom level "overview" landed at for each fixture.
async function fitToView(page, padding = 60) {
  return page.evaluate((padding) => {
    const { state, camera } = window.__kg;
    const minX = Math.min(...state.nodes.map((n) => n.x)), maxX = Math.max(...state.nodes.map((n) => n.x + n.w));
    const minY = Math.min(...state.nodes.map((n) => n.y)), maxY = Math.max(...state.nodes.map((n) => n.y + n.h));
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
    return scale;
  }, padding);
}

async function runOne(fixtureName, label) {
  const fixturePath = path.join(FIXTURES_DIR, fixtureName);
  const fixtureKey = fixtureName.replace(/\.domain\.yaml$/, "");
  const outDir = path.join(OUT_DIR, fixtureKey);
  fs.mkdirSync(outDir, { recursive: true });

  await withPage(async (page) => {
    await setTheme(page, "light");
    await importAndLayout(page, fixturePath);

    const overviewScale = await fitToView(page);
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(outDir, `${label}-1-overview.png`) });
    console.log(`[zoom-check] ${fixtureKey} overview scale = ${overviewScale.toFixed(3)}`);

    await setCamera(page, { scale: 1, centerOn: "busiest" });
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(outDir, `${label}-2-normal-zoom.png`) });

    await setCamera(page, { scale: 2.2, centerOn: "busiest" });
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(outDir, `${label}-3-close-up.png`) });
  });
}

async function main() {
  const [label, ...requested] = process.argv.slice(2);
  if (!label) {
    console.error("Usage: node tools/zoom-check.mjs <label> [fixture-basename ...]");
    process.exit(1);
  }
  const fixtures = requested.length ? requested : defaultFixtures();
  for (const fx of fixtures) {
    console.log(`[zoom-check] ${label} :: ${fx} ...`);
    await runOne(fx, label);
  }
  console.log("[zoom-check] done");
}

main();
