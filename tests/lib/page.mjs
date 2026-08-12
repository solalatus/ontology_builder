import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { launchChromium } from "./browser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const APP_URL = "file://" + path.resolve(__dirname, "..", "..", "index.html");

// Opens index.html (or `url`, e.g. a served http:// origin for OPFS tests —
// see tests/lib/server.mjs) in a fresh headless page, fails the test on any
// console/page error, and always closes the browser.
//
// Pins the UI language to English by default (`lang: "en"`) — the app's own
// real default is Hungarian (see tests/localization.spec.mjs, which is the
// one file that needs to see that), but every other test in this suite was
// written against English button/placeholder text and is testing
// functionality, not translation; forcing English here keeps all of that
// decoupled from the language feature instead of needing every assertion
// rewritten. Pass `lang: null` (or "hu") to see the app's actual default or
// exercise a specific language on purpose.
//
// The pin is applied via page.evaluate() *after* window.__kg exists, not via
// addInitScript. addInitScript re-runs on every navigation (including
// page.reload()), and a script that writes to localStorage at that early,
// pre-navigation point races with Chromium's localStorage rehydration for
// file:// origins — intermittently (~15-20% of runs) wiping the app's own
// already-saved Tier 1 data. That race reproduces even on unmodified code
// with any addInitScript that touches localStorage, regardless of key; it
// is a test-infra hazard, not an app bug. Setting the pin after load, the
// same way a real user's click on the language toggle would, avoids it.
export async function withPage(fn, { url = APP_URL, lang = "en", viewport = { width: 1200, height: 800 }, welcome = false } = {}) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  await page.goto(url);
  await page.waitForFunction(() => Boolean(window.__kg));
  if (lang) await page.evaluate((l) => { if (window.__kg.lang.get() !== l) window.__kg.lang.toggle(); }, lang);
  // Welcome popup (issue #78): shown once, automatically, on a genuinely
  // fresh profile -- exactly what every withPage() call starts as. Every
  // test written before this feature existed assumes an interactive
  // toolbar/canvas the instant the page loads, not a full-screen modal
  // blocking it, so it's auto-dismissed by default here; pass
  // `welcome: true` to see the real first-visit behavior, same "opt in to
  // the real default" pattern `lang` above already uses.
  if (!welcome) await page.evaluate(() => window.__kg.welcome.close());
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

// Connect mode is sticky (unlike Add Node's one-shot mode), so it may
// already be armed from a previous call in the same test — set it
// explicitly rather than toggling the button, which would turn it off.
//
// Also clears any lingering selection first: setMode() doesn't touch
// state.selection, so the floating #sel-toolbar from a *previous*
// selection (e.g. the edge just created by an earlier call to this same
// helper — createEdge selects its own result) stays on screen across the
// mode switch. Wide enough (multiple icons — see agent_ontology_spec.md
// §7's added 4th icon), it can sit directly over a nearby node's own
// click point and swallow the tap meant to arm connect-mode's source,
// hanging this function's later waitForSelector forever. Waits for the
// actual DOM hide, not just the state change — clearSelection() only sets
// a dirty flag; the hide itself happens on the next render() tick (the
// same race documented next to its other occurrence in
// parallel-edges.spec.mjs).
export async function createEdgeViaConnectMode(page, ax, ay, bx, by, relation) {
  await page.evaluate(() => window.__kg.actions.clearSelection());
  await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display === "none");
  await page.evaluate(() => window.__kg.actions.setMode("connect"));
  const box = await page.locator("#canvas").boundingBox();
  await page.mouse.click(box.x + ax, box.y + ay);
  await page.mouse.click(box.x + bx, box.y + by);
  await page.waitForSelector(".kg-inline-input");
  if (relation) await page.locator(".kg-inline-input").fill(relation);
  await page.keyboard.press("Enter");
  await page.waitForSelector(".kg-inline-input", { state: "detached" });
}

// Waits until a computed style (optionally of a pseudo-element) settles on
// `expected`, then returns it.
//
// The pattern this replaces is `page.hover(...)` followed by
// `page.waitForTimeout(150)` and an equality assertion. That samples the style
// at one arbitrary instant: if a CSS transition has not finished — which under
// a loaded machine running the whole suite it often has not — the value read
// is a mid-flight `0.73` rather than the `1` the test means, and the test
// fails for reasons that have nothing to do with the app. Three different
// tooltip and panel-geometry tests in this suite have flaked exactly that way.
//
// Polling for the settled value is *stronger*, not weaker: the old form
// asserted "at t=150ms this happened to be right", while this asserts "this
// genuinely reaches the expected end state", and fails with the last value it
// saw if it never does.
export async function waitForComputedStyle(page, selector, prop, expected, { pseudo = null, timeout = 5000 } = {}) {
  try {
    await page.waitForFunction(
      ({ selector, prop, expected, pseudo }) => {
        const el = document.querySelector(selector);
        return Boolean(el) && getComputedStyle(el, pseudo)[prop] === expected;
      },
      { selector, prop, expected, pseudo },
      { timeout },
    );
  } catch (err) {
    const actual = await page.evaluate(
      ({ selector, prop, pseudo }) => {
        const el = document.querySelector(selector);
        return el ? getComputedStyle(el, pseudo)[prop] : "(no such element)";
      },
      { selector, prop, pseudo },
    );
    throw new Error(`${selector}${pseudo || ""} ${prop}: expected ${JSON.stringify(expected)}, settled on ${JSON.stringify(actual)}`);
  }
  return expected;
}
