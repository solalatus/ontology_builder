import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// The global keydown handler (index.html) special-cases Escape for Confirm,
// Details, and Domain Model, but Import, Welcome, Help, Consistency, Review
// Changes, Agent Connect, and Azure Config were all added later without ever
// being wired into it -- a user pressing Escape on any of them had to reach
// for a Cancel/Close button or the backdrop instead. This file pins Escape
// working uniformly across the dialog set.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.resolve(__dirname, "fixtures", name);

async function overlayDisplay(page, id) {
  return page.evaluate((id) => getComputedStyle(document.getElementById(id)).display, id);
}

// #agent-connect-open lives inside the (collapsed-by-default) agent panel.
async function openAgentPanel(page) {
  const expanded = await page.evaluate(() => window.__kg.agent.isExpanded());
  if (!expanded) await page.click("#agent-panel-toggle");
}

test("Escape closes the Consistency dialog", async () => {
  await withPage(async (page) => {
    await page.click("#btn-consistency");
    await page.waitForSelector("#consistency-overlay", { state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "consistency-overlay"), "none");
  });
});

test("Escape closes the Review Changes dialog", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "A"); // one undo step, enables the button
    await page.click("#btn-review-changes");
    await page.waitForSelector("#review-changes-overlay", { state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "review-changes-overlay"), "none");
  });
});

test("Escape closes the Import dialog", async () => {
  await withPage(async (page) => {
    await page.setInputFiles("#import-file-input", fixture("subset.txt"));
    await page.waitForSelector("#import-overlay", { state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "import-overlay"), "none");
  });
});

test("Escape closes the Welcome popup", async () => {
  await withPage(async (page) => {
    assert.equal(await overlayDisplay(page, "welcome-overlay"), "flex");
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "welcome-overlay"), "none");
  }, { welcome: true });
});

test("Escape closes the Help dialog", async () => {
  await withPage(async (page) => {
    await page.click("#btn-help");
    await page.waitForSelector("#help-overlay", { state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "help-overlay"), "none");
  });
});

test("Escape closes the Agent Connect modal", async () => {
  await withPage(async (page) => {
    await openAgentPanel(page);
    await page.click("#agent-connect-open");
    await page.waitForSelector("#agent-connect-overlay", { state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "agent-connect-overlay"), "none");
  });
});

test("Escape closes the Azure config popup, not the whole Agent Connect flow behind it", async () => {
  await withPage(async (page) => {
    await openAgentPanel(page);
    await page.click("#agent-connect-open");
    await page.click("#agent-azure-config-open");
    await page.waitForSelector("#agent-azure-config-overlay", { state: "visible" });
    await page.keyboard.press("Escape");
    assert.equal(await overlayDisplay(page, "agent-azure-config-overlay"), "none");
    assert.equal(await overlayDisplay(page, "agent-connect-overlay"), "flex",
      "Escape on the Azure popup should return to the main Connect modal, same as its own Cancel button");
  });
});
