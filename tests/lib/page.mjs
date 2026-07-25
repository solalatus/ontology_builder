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

// One-shot toolbar-armed placement, used for both "Add Node" and "Add Group"
// (btnId is '#btn-add-node' or '#btn-add-group').
export async function addNodeViaButton(page, btnId, sx, sy, label) {
  const box = await page.locator("#canvas").boundingBox();
  await page.click(btnId);
  await page.mouse.click(box.x + sx, box.y + sy);
  await page.waitForSelector(".kg-inline-input");
  await page.locator(".kg-inline-input").fill(label);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".kg-inline-input", { state: "detached" });
}

// Drags whatever node is at (fromSx, fromSy) to (toSx, toSy) with enough
// intermediate steps to clear the move threshold and trigger a real drag.
export async function dragNode(page, fromSx, fromSy, toSx, toSy) {
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.move(box.x + fromSx, box.y + fromSy);
  await page.mouse.down();
  await page.mouse.move(box.x + toSx, box.y + toSy, { steps: 10 });
  await page.mouse.up();
}
