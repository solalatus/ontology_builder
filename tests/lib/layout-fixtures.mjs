// Shared helpers for driving a fixture through the real import -> Auto-
// layout UI flow — used by both tools/layout-bench.mjs (dev-only visual/
// exploratory bench for issue #64's autolayout work) and
// tests/autolayout-quality.spec.mjs (permanent regression tests), so
// there's exactly one "how do we get a fixture laid out" implementation.
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURES_DIR = path.resolve(__dirname, "..", "fixtures");

export function defaultFixtures() {
  return fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".domain.yaml")).sort();
}

// Screenshots/renders default to light theme -- easier to read node/edge-
// label text against than the app's own dark default. Uses the same
// window.__kg.theme test hook tests/theme.spec.mjs exercises, not a UI
// click, since it's a one-line no-visible-affordance toggle.
export async function setTheme(page, theme) {
  await page.evaluate((theme) => {
    if (window.__kg.theme.get() !== theme) window.__kg.theme.toggle();
  }, theme);
}

// Imports a fixture .domain.yaml via the real file-input + "Merge" flow
// (same as tests/phase6.spec.mjs's triggerImport, generalized to YAML),
// then runs an explicit second Auto-layout pass on top of
// commitYamlImport's own internal one -- matching the literal "import,
// then Auto-layout" workflow a user would follow, not just relying on the
// import's internal pass alone.
export async function importAndLayout(page, fixturePath) {
  await page.setInputFiles("#import-file-input", fixturePath);
  await page.waitForSelector("#import-overlay", { state: "visible" });
  await page.click("#import-merge");
  await page.waitForFunction(() => window.__kg.history.past.length >= 1);
  await page.click("#btn-autolayout");
  await page.waitForFunction(() => window.__kg.history.past.length >= 2);
}
