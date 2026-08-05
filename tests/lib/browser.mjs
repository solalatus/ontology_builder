// Loads Playwright's chromium launcher, tolerating environments where it's
// installed globally rather than as a project dependency (see tests/README.md).
async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
    try {
      return await import("/opt/node22/lib/node_modules/playwright/index.js");
    } catch {
      throw new Error(
        "Playwright not found. Run `npm install -D playwright` in the repo " +
        "root (and `npx playwright install chromium` if no system Chromium " +
        "is available) — see tests/README.md."
      );
    }
  }
}

// Resolved on first launch, not at import time. Top-level `await
// loadPlaywright()` used to run whenever anything in this module's import
// graph was loaded, so a script that only ever reads saved JSON off disk --
// rescore-saved-run.mjs, which reaches this file transitively through
// llmMatcher -> liveOpenAi -> page -- failed on a missing browser it never
// intended to open. Offline re-scoring has to work without a browser or an
// API key; that is the whole point of it.
let pwPromise = null;
async function playwright() {
  if (!pwPromise) pwPromise = loadPlaywright();
  return pwPromise;
}

export async function getChromium() {
  const pw = await playwright();
  return pw.default?.chromium ?? pw.chromium;
}

// This sandbox pre-installs Chromium outside Playwright's usual cache dir;
// fall back to that explicit path if the default launch can't find a browser.
export async function launchChromium(opts = {}) {
  const chromium = await getChromium();
  try {
    return await chromium.launch(opts);
  } catch (err) {
    try {
      return await chromium.launch({ ...opts, executablePath: "/opt/pw-browsers/chromium" });
    } catch {
      throw err;
    }
  }
}
