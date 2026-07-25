import { test } from "node:test";
import assert from "node:assert/strict";
import { launchChromium } from "./lib/browser.mjs";
import { APP_URL, addNodeViaDblClick } from "./lib/page.mjs";

// Phase 7 (Tier 2 storage) needs two things withPage()/withDownloadPage()
// (see phase5.spec.mjs) don't offer: (a) an init script installed *before*
// index.html's own scripts run, since boot() feature-detects
// showDirectoryPicker synchronously at load time, and (b) real browser
// downloads collected, to prove Tier 2 does NOT also trigger a Tier 3
// download when connected. So this file drives its own page lifecycle,
// with an optional pre-navigation init script.
async function withFolderPage(fn, { initScript } = {}) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  if (initScript) await page.addInitScript(initScript.fn, initScript.arg);
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  // The app's real default UI language is Hungarian; this suite (like the
  // shared withPage() in lib/page.mjs) pins English so its existing text
  // assertions (e.g. the Folder Sync button's label) stay decoupled from
  // the language feature. Pinned via evaluate() post-load rather than
  // addInitScript — see the comment in lib/page.mjs's withPage() for why
  // an addInitScript localStorage write racing with page.reload() is
  // intermittently destructive to Tier 1 data on file:// origins.
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  try {
    await fn(page, downloads);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

async function readDownload(dl) {
  const stream = await dl.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

// Installs a fake showDirectoryPicker that "grants" an in-memory folder and
// records every write into window.__mockFolderWrites, keyed by filename.
// Runs via addInitScript so it's in place before index.html's own scripts
// (and boot()'s feature detection) execute.
function installMockPicker({ name = "MockFolder", rejectWith = null } = {}) {
  return {
    arg: { name, rejectWith },
    fn: ({ name, rejectWith }) => {
      window.__mockFolderWrites = {};
      window.showDirectoryPicker = async () => {
        if (rejectWith) {
          const e = new Error(rejectWith);
          e.name = rejectWith;
          throw e;
        }
        return {
          name,
          async getFileHandle(filename) {
            return {
              async createWritable() {
                return {
                  async write(content) { window.__mockFolderWrites[filename] = content; },
                  async close() {},
                };
              },
            };
          },
        };
      };
    },
  };
}

// A picker grant that succeeds, but whose writes always fail — exercises
// performSaveVersion()'s fallback-to-download branch.
function installFailingWritePicker() {
  return {
    arg: undefined,
    fn: () => {
      window.showDirectoryPicker = async () => ({
        name: "BrokenFolder",
        async getFileHandle() {
          throw new Error("simulated write failure");
        },
      });
    },
  };
}

test("real Chromium exposes showDirectoryPicker, so the Folder Sync button is revealed on boot", async () => {
  await withFolderPage(async (page) => {
    const display = await page.locator("#btn-folder-sync").evaluate((el) => getComputedStyle(el).display);
    assert.notEqual(display, "none");
    assert.equal(await page.locator("#btn-folder-sync").textContent(), "Folder Sync");
    assert.equal(await page.getAttribute("#btn-folder-sync", "aria-pressed"), "false");
  });
});

test("when showDirectoryPicker is absent (Brave/Android), the button stays hidden and the app runs error-free", async () => {
  await withFolderPage(async (page) => {
    const display = await page.locator("#btn-folder-sync").evaluate((el) => getComputedStyle(el).display);
    assert.equal(display, "none");
    // Tier 2 entirely absent must not block ordinary use.
    await addNodeViaDblClick(page, 300, 300, "Still Works");
    assert.equal(await page.evaluate(() => window.__kg.state.nodes.length), 1);
  }, {
    initScript: { fn: () => { delete window.showDirectoryPicker; } },
  });
});

test("clicking Folder Sync grants a folder and updates the button to reflect the connected state", async () => {
  await withFolderPage(async (page) => {
    await page.click("#btn-folder-sync");
    await page.waitForFunction(() => window.__kg.tier2.getDirHandle() !== null);

    assert.equal(await page.locator("#btn-folder-sync").textContent(), "Synced: MockFolder");
    assert.equal(await page.getAttribute("#btn-folder-sync", "aria-pressed"), "true");
  }, { initScript: installMockPicker({ name: "MockFolder" }) });
});

test("a cancelled picker (AbortError) leaves Tier 2 disconnected, with no console error", async () => {
  await withFolderPage(async (page) => {
    await page.click("#btn-folder-sync");
    await page.waitForTimeout(200);

    assert.equal(await page.evaluate(() => window.__kg.tier2.getDirHandle()), null);
    assert.equal(await page.locator("#btn-folder-sync").textContent(), "Folder Sync");
    assert.equal(await page.getAttribute("#btn-folder-sync", "aria-pressed"), "false");
  }, { initScript: installMockPicker({ rejectWith: "AbortError" }) });
});

test("once connected, Save Version writes silently into the folder and triggers no browser download", async () => {
  await withFolderPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-folder-sync");
    await page.waitForFunction(() => window.__kg.tier2.getDirHandle() !== null);

    await page.click("#btn-save-version");
    await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());

    assert.equal(downloads.length, 0, "Tier 2 write should replace, not supplement, the Tier 3 download");

    const writes = await page.evaluate(() => window.__mockFolderWrites);
    const filenames = Object.keys(writes).sort();
    assert.equal(filenames.length, 2);
    assert.match(filenames[0], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.json$/);
    assert.match(filenames[1], /^Untitled-Graph_v0001_\d{4}-\d{2}-\d{2}T\d{4}Z\.txt$/);

    const jsonWrite = writes[filenames[0]];
    const parsed = JSON.parse(jsonWrite);
    assert.equal(parsed.nodes.length, 1);
    assert.equal(parsed.nodes[0].label, "Alpha");
  }, { initScript: installMockPicker({ name: "MockFolder" }) });
});

test("if a Tier 2 write fails after grant, Save Version falls back to a Tier 3 download instead of losing the save", async () => {
  await withFolderPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-folder-sync");
    await page.waitForFunction(() => window.__kg.tier2.getDirHandle() !== null);

    await page.click("#btn-save-version");
    await page.evaluate(() => window.__kg.tier2.waitForSaveVersion());
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 2, "a failed folder write should still produce the usual two downloads");
    const names = downloads.map((d) => d.suggestedFilename()).sort();
    assert.match(names[0], /\.json$/);
    assert.match(names[1], /\.txt$/);
  }, { initScript: installFailingWritePicker() });
});

test("without ever connecting Folder Sync, Save Version behaves exactly like Tier 3 baseline (two downloads)", async () => {
  await withFolderPage(async (page, downloads) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.click("#btn-save-version");
    await page.waitForTimeout(200);

    assert.equal(downloads.length, 2);
    assert.equal(await page.evaluate(() => window.__kg.tier2.getDirHandle()), null);
  }, { initScript: installMockPicker({ name: "UnusedFolder" }) });
});

test("the tier2.setDirHandle test hook drives the same button state as a real grant", async () => {
  await withFolderPage(async (page) => {
    await page.evaluate(() => window.__kg.tier2.setDirHandle({ name: "InjectedFolder" }));
    assert.equal(await page.locator("#btn-folder-sync").textContent(), "Synced: InjectedFolder");
    assert.equal(await page.getAttribute("#btn-folder-sync", "aria-pressed"), "true");

    await page.evaluate(() => window.__kg.tier2.setDirHandle(null));
    assert.equal(await page.locator("#btn-folder-sync").textContent(), "Folder Sync");
    assert.equal(await page.getAttribute("#btn-folder-sync", "aria-pressed"), "false");
  });
});
