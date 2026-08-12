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

// Waits until the canvas has actually repainted at least once since `since`
// (a frame count previously read from renderFrame()).
//
// render() is not called synchronously by the actions that mutate state — they
// set a dirty flag and a requestAnimationFrame loop picks it up (index.html,
// `function loop()`). So "click, then read the canvas" needs a wait, and the
// pattern this replaces was `waitForTimeout(150)`: a guess that a frame will
// have landed within 150ms. On a loaded machine running the whole suite it
// sometimes has not, and the test fails having asserted nothing about the app.
//
// This is strictly stronger. It waits for the event the old form was guessing
// at, so it cannot pass early, and it stops as soon as the frame lands rather
// than always paying the full 150ms.
export const renderFrame = (page) => page.evaluate(() => window.__kg.perf.getRenderStats().frames);

export async function waitForRender(page, since, { timeout = 5000 } = {}) {
  await page.waitForFunction((n) => window.__kg.perf.getRenderStats().frames > n, since, { timeout });
}

// Click, wait for the whole action to have landed: the state mutation (which
// runs synchronously inside the click handler) and the repaint that follows it.
// `settle` runs the pair in one call for any click that redraws the canvas.
export async function settle(page, fn) {
  const before = await renderFrame(page);
  await fn();
  await waitForRender(page, before);
}

// Waits until `downloads` (the array a test's own download page helper fills
// from page.on("download")) holds at least `count` entries.
//
// Replaces `waitForTimeout(250)` after a Save Version click. That form asserted
// nothing: if the browser had not raised the download events yet, the test read
// an empty array and failed on a missing file that was merely late. This waits
// for the events themselves, and on timeout says how many actually arrived.
export async function waitForDownloads(downloads, count, { timeout = 5000 } = {}) {
  const deadline = Date.now() + timeout;
  while (downloads.length < count) {
    if (Date.now() > deadline) {
      throw new Error(`expected ${count} download(s), saw ${downloads.length}: ${downloads.map((d) => d.suggestedFilename()).join(", ")}`);
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  return downloads;
}

// Applies a pending import dialog through the real Merge/Replace button and
// waits for the import to have fully landed.
//
// runPendingImport() (index.html) hides the overlay *before* committing, but
// both happen inside one click handler, so the hidden overlay is only ever
// observable from outside once the commit has also run — waiting for it is a
// real signal, not a race. The repaint that follows is separate, hence the
// frame wait.
export async function applyImport(page, buttonId = "#import-merge") {
  const before = await renderFrame(page);
  await page.click(buttonId);
  await page.waitForSelector("#import-overlay", { state: "hidden" });
  await waitForRender(page, before);
}

// Waits until an element's box has stopped moving — i.e. the CSS transition
// that was animating it has finished.
//
// Replaces `waitForTimeout(150)` after toggling something that shifts layout
// (the agent panel's `--agent-panel-offset`, for one). A fixed sleep both
// over-waits when the transition is quick and, on a loaded machine, samples
// mid-flight geometry and asserts against a position the element was only
// passing through. This polls until `stableFrames` consecutive animation
// frames report an identical box, so it observes the settled layout by
// construction.
export async function waitForGeometrySettled(page, selector, { stableFrames = 3, timeout = 5000 } = {}) {
  await page.waitForFunction(
    ({ selector, stableFrames }) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const key = `${r.x},${r.y},${r.width},${r.height}`;
      window.__kgBoxProbe = window.__kgBoxProbe || {};
      const prev = window.__kgBoxProbe[selector];
      window.__kgBoxProbe[selector] = prev && prev.key === key ? { key, n: prev.n + 1 } : { key, n: 1 };
      return window.__kgBoxProbe[selector].n >= stableFrames;
    },
    { selector, stableFrames },
    { timeout, polling: "raf" },
  );
  await page.evaluate((s) => { if (window.__kgBoxProbe) delete window.__kgBoxProbe[s]; }, selector);
}

// Waits until the canvas view transform (pan + zoom) stops changing.
//
// Replaces the `waitForTimeout(50)` that followed a pan or zoom drag before a
// test read worldToScreen(). Probing the transform itself means the read
// happens after it has actually settled, however long that takes, rather than
// after a fixed 50ms that was only ever a guess about it.
export async function waitForViewSettled(page, { stableFrames = 3, timeout = 5000 } = {}) {
  await page.waitForFunction(
    (stableFrames) => {
      const a = window.__kg.worldToScreen(0, 0), b = window.__kg.worldToScreen(1000, 1000);
      const key = `${a.x},${a.y},${b.x},${b.y}`;
      const prev = window.__kgViewProbe;
      window.__kgViewProbe = prev && prev.key === key ? { key, n: prev.n + 1 } : { key, n: 1 };
      return window.__kgViewProbe.n >= stableFrames;
    },
    stableFrames,
    { timeout, polling: "raf" },
  );
  await page.evaluate(() => { delete window.__kgViewProbe; });
}

// Waits until a computed style stops changing, and returns the settled value.
//
// The sibling of waitForComputedStyle() for the case where the test does not
// know the target value up front — "an armed button's border must read
// differently from an ordinary one" needs the border-color transition to have
// finished, but has no constant to wait for. Sleeping 200ms and sampling
// leaves the assertion comparing whatever the transition happened to be
// passing through; this returns the value the property actually lands on.
export async function waitForStyleSettled(page, selector, prop, { stableFrames = 3, timeout = 5000 } = {}) {
  await page.waitForFunction(
    ({ selector, prop, stableFrames }) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const value = getComputedStyle(el)[prop];
      window.__kgStyleProbe = window.__kgStyleProbe || {};
      const at = `${selector}|${prop}`;
      const prev = window.__kgStyleProbe[at];
      window.__kgStyleProbe[at] = prev && prev.value === value ? { value, n: prev.n + 1 } : { value, n: 1 };
      return window.__kgStyleProbe[at].n >= stableFrames;
    },
    { selector, prop, stableFrames },
    { timeout, polling: "raf" },
  );
  return page.evaluate(({ selector, prop }) => {
    if (window.__kgStyleProbe) delete window.__kgStyleProbe[`${selector}|${prop}`];
    return getComputedStyle(document.querySelector(selector))[prop];
  }, { selector, prop });
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
