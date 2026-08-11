import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";
import { launchChromium } from "./lib/browser.mjs";

// frontend-design skill's quality floor: "responsive down to mobile,
// visible keyboard focus, reduced motion respected." Every animated
// transition in index.html keys off the single --transition-fast custom
// property (verified: no @keyframes/animation rules exist at all, only
// `transition:` declarations referencing that one token) -- so the fix is
// one @media (prefers-reduced-motion: reduce) override of that token, and
// these tests check it actually reaches every transition, not just the
// token itself, while also confirming the default (no-preference) case is
// completely unaffected.
//
// withPage() doesn't expose a way to set page.emulateMedia() before the
// app's own CSS is parsed, so these launch their own page directly (same
// pattern tests/filename-sanitization.spec.mjs already uses for a need
// withPage() doesn't cover) rather than extending that shared helper for
// a media feature only this file needs.

async function launchWithMotionPreference(reducedMotion) {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.emulateMedia({ reducedMotion });
  await page.goto("file://" + process.cwd() + "/index.html");
  await page.waitForFunction(() => Boolean(window.__kg));
  await page.evaluate(() => { if (window.__kg.lang.get() !== "en") window.__kg.lang.toggle(); });
  await page.evaluate(() => window.__kg.welcome.close()); // issue #78: this file has its own page-open helper, not tests/lib/page.mjs's withPage()
  return { browser, page };
}

test("--transition-fast resolves to 0ms when the OS/browser requests reduced motion", async () => {
  const { browser, page } = await launchWithMotionPreference("reduce");
  try {
    const value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--transition-fast").trim());
    assert.equal(value, "0ms");
  } finally {
    await browser.close();
  }
});

test("--transition-fast keeps its normal duration when no motion preference is requested", async () => {
  const { browser, page } = await launchWithMotionPreference("no-preference");
  try {
    const value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--transition-fast").trim());
    assert.equal(value, "120ms ease");
  } finally {
    await browser.close();
  }
});

test("under reduced motion, an ordinary button's actual transition-duration is zero, not just the token", async () => {
  // Proves the override reaches a real rule (#toolbar button's own
  // multi-property transition declaration), not only the custom property
  // in isolation -- a typo in the selector chain feeding var(--transition-fast)
  // wouldn't be caught by the token-only check above.
  const { browser, page } = await launchWithMotionPreference("reduce");
  try {
    const duration = await page.evaluate(() => getComputedStyle(document.getElementById("btn-add-node")).transitionDuration);
    assert.ok(
      duration.split(",").every((d) => parseFloat(d) === 0),
      `expected every transitioned property to have a 0-duration, got: ${duration}`
    );
  } finally {
    await browser.close();
  }
});

test("under reduced motion, the agent-panel toggle's hover transition-duration is also zero", async () => {
  // A second, independently-styled element (different rule, added in the
  // 2026-08 #8 chrome-unification pass) -- covers more than one call site
  // reading var(--transition-fast) instead of just the toolbar's.
  const { browser, page } = await launchWithMotionPreference("reduce");
  try {
    const duration = await page.evaluate(() => getComputedStyle(document.getElementById("agent-panel-toggle")).transitionDuration);
    assert.ok(duration.split(",").every((d) => parseFloat(d) === 0), `expected zero duration, got: ${duration}`);
  } finally {
    await browser.close();
  }
});

test("under reduced motion, hovering a button still lands the correct end-state style -- just instantly, not never", async () => {
  // Functional pairing: reduced motion means no animated interpolation,
  // not "the state change doesn't happen." Mirrors the armed-button
  // border-color check in ui-polish.spec.mjs, but with zero settle-wait --
  // if a real transition were still running, sampling immediately after
  // hover would (as that file's own comments note) risk an intermediate,
  // interpolated color instead of the resting or fully-hovered one.
  const { browser, page } = await launchWithMotionPreference("reduce");
  try {
    const restBackground = await page.evaluate(() => getComputedStyle(document.getElementById("btn-undo")).backgroundColor);
    await page.hover("#btn-undo");
    const hoverBackground = await page.evaluate(() => getComputedStyle(document.getElementById("btn-undo")).backgroundColor);
    assert.notEqual(hoverBackground, restBackground, "hover feedback should still apply, immediately, under reduced motion");
  } finally {
    await browser.close();
  }
});

test("without a reduced-motion preference, hover transitions still animate over their normal duration", async () => {
  // Regression guard: the whole point of gating this behind a media query
  // is that everyone else's experience is unchanged -- this pins that the
  // default (no-preference) case still reports the pre-existing 120ms.
  await withPage(async (page) => {
    const duration = await page.evaluate(() => getComputedStyle(document.getElementById("btn-add-node")).transitionDuration);
    assert.ok(duration.split(",").every((d) => Math.abs(parseFloat(d) - 0.12) < 0.001), `expected 120ms transitions by default, got: ${duration}`);
  });
});
