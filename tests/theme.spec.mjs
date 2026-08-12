import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, settle } from "./lib/page.mjs";

async function htmlThemeAttr(page) {
  return page.evaluate(() => document.documentElement.dataset.theme);
}
async function themeButtonText(page) {
  return page.locator("#btn-theme-toggle").textContent();
}
async function nodeFillPixel(page) {
  // Reads back an actual rendered canvas pixel near a node's top-left
  // corner (away from the centered label text, whose own theme-dependent
  // color would otherwise contaminate the sample) — proves the theme
  // change reaches Canvas2D draw colors, not just DOM/CSS.
  return page.evaluate(() => {
    const canvas = document.getElementById("canvas");
    const c = canvas.getContext("2d");
    const node = window.__kg.state.nodes[0];
    const screen = window.__kg.worldToScreen(node.x + 8, node.y + 8);
    const dpr = window.devicePixelRatio || 1;
    const data = c.getImageData(Math.round(screen.x * dpr), Math.round(screen.y * dpr), 1, 1).data;
    return [data[0], data[1], data[2]];
  });
}

test("defaults to dark theme on a fresh load (no prior localStorage)", async () => {
  await withPage(async (page) => {
    assert.equal(await htmlThemeAttr(page), "dark");
    assert.equal(await themeButtonText(page), "Theme: Dark");
    assert.equal(await page.getAttribute("#btn-theme-toggle", "aria-pressed"), "false");
  });
});

test("clicking the toggle switches to light, updating the <html> attribute, button label, and aria-pressed", async () => {
  await withPage(async (page) => {
    await page.click("#btn-theme-toggle");
    assert.equal(await htmlThemeAttr(page), "light");
    assert.equal(await themeButtonText(page), "Theme: Light");
    assert.equal(await page.getAttribute("#btn-theme-toggle", "aria-pressed"), "true");

    await page.click("#btn-theme-toggle");
    assert.equal(await htmlThemeAttr(page), "dark");
    assert.equal(await themeButtonText(page), "Theme: Dark");
    assert.equal(await page.getAttribute("#btn-theme-toggle", "aria-pressed"), "false");
  });
});

test("toggling theme actually repaints the canvas — a node's fill pixel changes color between themes", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Alpha");
    const darkPixel = await nodeFillPixel(page);

    // wait for the dirty-flag render loop to actually repaint before sampling
    await settle(page, () => page.click("#btn-theme-toggle"));
    const lightPixel = await nodeFillPixel(page);

    assert.notDeepEqual(darkPixel, lightPixel, "node fill pixel should differ between dark and light themes");
    // Light theme's node fill is #ffffff — the pixel should read as bright.
    assert.ok(lightPixel[0] > 200 && lightPixel[1] > 200 && lightPixel[2] > 200, `expected a light pixel, got ${lightPixel}`);
    // Dark theme's node fill is #242424 — the pixel should read as dark.
    assert.ok(darkPixel[0] < 100 && darkPixel[1] < 100 && darkPixel[2] < 100, `expected a dark pixel, got ${darkPixel}`);
  });
});

test("theme choice persists across a reload", async () => {
  await withPage(async (page) => {
    await page.click("#btn-theme-toggle"); // -> light
    assert.equal(await htmlThemeAttr(page), "light");

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));

    assert.equal(await htmlThemeAttr(page), "light");
    assert.equal(await themeButtonText(page), "Theme: Light");
  });
});

test("toggling theme is not an undoable graph action — it never touches the undo/redo stack", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));

    await page.click("#btn-theme-toggle");
    await page.click("#btn-theme-toggle");

    const after = await page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));
    assert.deepEqual(after, before);
  });
});

test("the window.__kg.theme test hook mirrors the toggle button's behavior", async () => {
  await withPage(async (page) => {
    assert.equal(await page.evaluate(() => window.__kg.theme.get()), "dark");
    await page.evaluate(() => window.__kg.theme.toggle());
    assert.equal(await page.evaluate(() => window.__kg.theme.get()), "light");
    assert.equal(await htmlThemeAttr(page), "light");
    assert.equal(await themeButtonText(page), "Theme: Light");
  });
});
