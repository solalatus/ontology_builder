import { test } from "node:test";
import assert from "node:assert/strict";
import { APP_URL, waitForDownloads } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";
import { withPage } from "./lib/page.mjs";

// Graph-name sanitization for the versioned filename convention (spec.md §5.4).
//
// The original rule was a `[^A-Za-z0-9_-]` whitelist, which is ASCII-safe
// rather than filesystem-safe — a distinction that only shows up once someone
// names a graph in their own language. "Ügyfélkérdés ontológia" was written
// to disk as "gyflkrds-ontolgia", and a name in a non-Latin script emptied out
// entirely into the "graph" fallback, so every save from that user collided
// on one filename. These tests pin both halves: real names survive, and the
// characters that genuinely break filesystems still don't.

const sanitize = (page, name) =>
  page.evaluate((n) => window.__kg.formats.sanitizeGraphName(n), name);

// --------------------------------------------------------------------------
// Names that must survive
// --------------------------------------------------------------------------

test("Accented Latin text survives", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "Ügyfélkérdés ontológia"), "Ügyfélkérdés-ontológia");
    assert.equal(await sanitize(page, "München Straßen"), "München-Straßen");
    assert.equal(await sanitize(page, "árvíztűrő tükörfúrógép"), "árvíztűrő-tükörfúrógép");
  });
});

test("Non-Latin scripts survive instead of emptying to the fallback", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "知识图谱"), "知识图谱");
    assert.equal(await sanitize(page, "Граф знаний"), "Граф-знаний");
    assert.equal(await sanitize(page, "γράφος"), "γράφος");
  });
});

test("Plain ASCII names behave exactly as they always did", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "frankfurt ai ontology"), "frankfurt-ai-ontology");
    assert.equal(await sanitize(page, "my_graph-2"), "my_graph-2");
    assert.equal(await sanitize(page, "  padded  "), "padded");
  });
});

test("Digits from any script are kept", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "graph 42"), "graph-42");
  });
});

// --------------------------------------------------------------------------
// Characters that must not reach a filesystem
// --------------------------------------------------------------------------

test("Windows-reserved punctuation is stripped", async () => {
  await withPage(async (page) => {
    const out = await sanitize(page, 'a<b>c:d"e|f?g*h');
    for (const ch of ['<', '>', ':', '"', '|', '?', '*']) {
      assert.ok(!out.includes(ch), `"${out}" still contains ${ch}`);
    }
  });
});

// A `/` here would not just be an odd filename — the Tier 2 folder-sync
// writer calls getFileHandle() with it, so a name containing a separator
// would try to write into a subdirectory of the user's chosen folder.
test("Path separators can never survive", async () => {
  await withPage(async (page) => {
    for (const name of ["a/b", "a\\b", "../../etc/passwd", "/absolute"]) {
      const out = await sanitize(page, name);
      assert.ok(!out.includes("/"), `"${out}" still contains a forward slash`);
      assert.ok(!out.includes("\\"), `"${out}" still contains a backslash`);
    }
  });
});

test("Leading dots and dashes are trimmed", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "...hidden"), "hidden");
    assert.equal(await sanitize(page, "--flag"), "flag");
    assert.equal(await sanitize(page, "name..."), "name");
    assert.equal(await sanitize(page, ".."), "graph");
  });
});

test("Windows device names are escaped", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "CON"), "CON_");
    assert.equal(await sanitize(page, "nul"), "nul_");
    assert.equal(await sanitize(page, "COM1"), "COM1_");
    assert.equal(await sanitize(page, "console"), "console", "only the exact device names, not any name starting with one");
  });
});

test("An unusable name falls back rather than producing an empty filename", async () => {
  await withPage(async (page) => {
    for (const name of ["", "   ", "!!!", "///", "@@@"]) {
      assert.equal(await sanitize(page, name), "graph", `input ${JSON.stringify(name)}`);
    }
  });
});

test("Overlong names are capped by code point, never mid-character", async () => {
  await withPage(async (page) => {
    const long = await sanitize(page, "é".repeat(300));
    assert.equal([...long].length, 80);
    // An astral-plane character is two UTF-16 units — a naive slice() would
    // cut one in half and leave an unpaired surrogate in the filename.
    const astral = await sanitize(page, "𝔊".repeat(300));
    assert.equal([...astral].length, 80);
    assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(astral), "left an unpaired surrogate");
  });
});

test("Whitespace runs collapse to a single dash", async () => {
  await withPage(async (page) => {
    assert.equal(await sanitize(page, "a    b\t\tc"), "a-b-c");
  });
});

// --------------------------------------------------------------------------
// End to end: the name actually reaches the file
// --------------------------------------------------------------------------

// Asserts against window.__kg.getRecordedDownloadFilenames() -- the exact
// strings the app itself handed to `a.download` -- rather than a Download's
// own suggestedFilename(). At least one sandboxed headless Chromium build
// (141.0.7390.37, this repo's pinned Playwright version otherwise
// unchanged) resolves suggestedFilename() to the browser's literal fallback
// "download" for every filename containing non-ASCII characters, no matter
// how the download is triggered (a.download as a property or via
// setAttribute, a File object in place of Blob, a.click() vs. a dispatched
// MouseEvent -- all four verified to fail identically); the same build
// resolves a plain-ASCII filename correctly. Percent-encoding the filename
// does make that echo return a non-fallback value, but the real fix would
// then be worse than the bug: every user's downloaded file would save under
// a garbled name like "%C3%9Cgyf%C3%A9l...txt" instead of the readable
// Unicode name the app computed, just to satisfy this one sandbox's
// browser build. The recorded-filenames hook (see triggerDownload()'s own
// comment) sidesteps the browser-side echo entirely and still proves the
// actual value handed to the browser was correct.
test("An accented graph name reaches the saved filenames intact", async () => {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, acceptDownloads: true });
  const downloads = [];
  page.on("download", (dl) => downloads.push(dl));
  try {
    await page.goto(APP_URL);
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
    await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this test opens its own page, not tests/lib/page.mjs's withPage()
    await page.evaluate(() => {
      window.__kg.state.graphName = "Ügyfélkérdés ontológia";
      window.__kg.actions.createNode(0, 0, "A");
    });
    await page.click("#btn-save-version");
    await waitForDownloads(downloads, 3);

    // A real download still has to actually fire for each of the three
    // files -- this doesn't depend on the browser resolving the Unicode
    // filename correctly, only on triggerDownload() having run three times.
    assert.equal(downloads.length, 3);

    const names = (await page.evaluate(() => window.__kg.getRecordedDownloadFilenames())).sort();
    assert.equal(names.length, 3);
    for (const name of names) {
      assert.ok(name.startsWith("Ügyfélkérdés-ontológia_v0001_"), `unexpected filename: ${name}`);
    }
    assert.deepEqual(
      names.map((n) => n.slice(n.indexOf("Z.") + 1)).sort(),
      [".domain.yaml", ".json", ".txt"]);
  } finally {
    await browser.close();
  }
});
