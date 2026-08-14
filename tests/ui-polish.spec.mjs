import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, waitForStyleSettled } from "./lib/page.mjs";

// Locks in the visual-polish pass as actual, regression-tested behavior
// rather than something only eyeballed via screenshots once. Deliberately
// checks *computed* CSS (getComputedStyle), not exact pixel colors — the
// point is proving the new rules are actually applied to real DOM
// elements, not pinning down an exact hex value that'd make this brittle
// against a future retint.

async function computedStyle(page, selector, prop) {
  return page.evaluate(({ selector, prop }) => getComputedStyle(document.querySelector(selector))[prop], { selector, prop });
}

test("an armed toggle button (aria-pressed=true) gets a visually distinct border color from an ordinary button", async () => {
  await withPage(async (page) => {
    const ordinaryBorder = await computedStyle(page, "#btn-autolayout", "borderColor");

    await page.click("#btn-add-node");
    assert.equal(await page.getAttribute("#btn-add-node", "aria-pressed"), "true");
    // `differentFrom` for the same reason design-critique-round3 needs it: the
    // border animates, and the frames between the click and the transition
    // starting read as a perfectly stable *un*armed value under load.
    const armedBorder = await waitForStyleSettled(page, "#btn-add-node", "borderColor", { differentFrom: ordinaryBorder });

    assert.notEqual(armedBorder, ordinaryBorder, "an armed button's border must read differently from an ordinary button's");

    await page.keyboard.press("Escape"); // disarm
    assert.equal(await page.getAttribute("#btn-add-node", "aria-pressed"), "false");
    const disarmedBorder = await waitForStyleSettled(page, "#btn-add-node", "borderColor", { differentFrom: armedBorder });
    assert.equal(disarmedBorder, ordinaryBorder, "disarming reverts to the same border as an ordinary button");
  });
});

test("toolbar buttons render with rounded corners, not sharp rectangles", async () => {
  await withPage(async (page) => {
    const radius = await computedStyle(page, "#btn-add-node", "borderRadius");
    assert.notEqual(radius, "0px");
  });
});

test("the floating selection toolbar's buttons cast a shadow, reading as floating above the canvas", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display !== "none");

    const shadow = await computedStyle(page, "#sel-rename", "boxShadow");
    assert.notEqual(shadow, "none");
  });
});

test("modal dialogs cast a shadow distinguishing them from the darkened backdrop behind them", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);
    await page.click("#btn-clear");
    await page.waitForSelector("#confirm-dialog");

    const shadow = await computedStyle(page, "#confirm-dialog", "boxShadow");
    assert.notEqual(shadow, "none");
    await page.click("#confirm-cancel");
  });
});

test("toggling theme swaps the accent/shadow tokens too, not just the base palette — an armed button's border differs between themes", async () => {
  await withPage(async (page) => {
    const restingBorder = await computedStyle(page, "#btn-connect", "borderColor");
    await page.click("#btn-connect");
    const darkBorder = await waitForStyleSettled(page, "#btn-connect", "borderColor", { differentFrom: restingBorder });

    await page.click("#btn-theme-toggle");
    // This test previously sampled immediately after the click, racing the
    // border-color transition — a rare full-suite-under-load flake. Waiting
    // for "N identical frames" alone is not enough either: the frames before
    // the transition starts are identical at the OLD value, so each sample
    // has to be told what it is moving away from.
    const lightBorder = await waitForStyleSettled(page, "#btn-connect", "borderColor", { differentFrom: darkBorder });

    assert.notEqual(darkBorder, lightBorder, "the accent color used for an armed button's border should differ between dark and light themes");
    assert.equal(await page.getAttribute("#btn-connect", "aria-pressed"), "true", "toggling theme must not disarm an unrelated armed mode");
  });
});
