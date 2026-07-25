import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { launchChromium } from "./browser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const APP_URL = "file://" + path.resolve(__dirname, "..", "..", "index.html");

// Opens index.html in a fresh headless page, fails the test on any
// console/page error, and always closes the browser.
export async function withPage(fn) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(APP_URL);
  await page.waitForFunction(() => Boolean(window.__kg));
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
  assert.deepEqual(consoleErrors, [], "expected no console/page errors during the test");
}

export async function addNodeViaDblClick(page, sx, sy, label) {
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.dblclick(box.x + sx, box.y + sy);
  await page.waitForSelector(".kg-inline-input");
  await page.locator(".kg-inline-input").fill(label);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".kg-inline-input", { state: "detached" });
}
