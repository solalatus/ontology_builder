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

const pw = await loadPlaywright();
export const chromium = pw.default?.chromium ?? pw.chromium;

// This sandbox pre-installs Chromium outside Playwright's usual cache dir;
// fall back to that explicit path if the default launch can't find a browser.
export async function launchChromium(opts = {}) {
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
