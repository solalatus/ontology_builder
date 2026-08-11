import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

// Welcome popup + Help guide (issue #78): a one-time first-visit welcome
// (localStorage-gated, never again once dismissed on this machine), and a
// persistent Help guide reachable from a single toolbar button, with two
// subcategories: a usage guide and a concepts/terminology glossary. Both
// are fully bilingual (STRINGS.welcome*/help*) and never innerHTML content
// (createElement/textContent only).

// withPage() auto-dismisses the welcome popup by default (see its own
// comment in tests/lib/page.mjs) so the hundreds of pre-existing tests
// written before this feature existed aren't all blocked by it on load.
// Every test in this section needs the real first-visit behavior, so it
// explicitly opts back in with { welcome: true }.

test("the welcome popup shows automatically on a fresh profile, before the user does anything", async () => {
  await withPage(async (page) => {
    const display = await page.evaluate(() => document.getElementById("welcome-overlay").style.display);
    assert.equal(display, "flex");
    assert.equal(await page.evaluate(() => window.__kg.welcome.hasSeenBefore()), false);
  }, { welcome: true });
});

test("dismissing the welcome popup ('Got it') closes it and marks it seen in localStorage", async () => {
  await withPage(async (page) => {
    await page.click("#welcome-dismiss");
    assert.equal(await page.evaluate(() => document.getElementById("welcome-overlay").style.display), "none");
    assert.equal(await page.evaluate(() => window.__kg.welcome.hasSeenBefore()), true);
    assert.equal(await page.evaluate(() => localStorage.getItem(window.__kg.welcome.storageKey)), "1");
  }, { welcome: true });
});

test("the welcome popup never shows again after being dismissed, across a reload", async () => {
  await withPage(async (page) => {
    await page.click("#welcome-dismiss");
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));
    await page.waitForTimeout(100);
    const display = await page.evaluate(() => getComputedStyle(document.getElementById("welcome-overlay")).display);
    assert.equal(display, "none");
  }, { welcome: true });
});

test("'Open the guide first' closes the welcome popup, marks it seen, and opens Help directly on the usage tab", async () => {
  await withPage(async (page) => {
    await page.click("#welcome-open-help");
    assert.equal(await page.evaluate(() => document.getElementById("welcome-overlay").style.display), "none");
    assert.equal(await page.evaluate(() => window.__kg.welcome.hasSeenBefore()), true);
    assert.equal(await page.evaluate(() => document.getElementById("help-overlay").style.display), "flex");
    assert.equal(await page.evaluate(() => window.__kg.help.getActiveTab()), "usage");
  }, { welcome: true });
});

test("clicking outside the welcome dialog (on the overlay backdrop) also dismisses and marks it seen", async () => {
  await withPage(async (page) => {
    await page.click("#welcome-overlay", { position: { x: 5, y: 5 } });
    assert.equal(await page.evaluate(() => document.getElementById("welcome-overlay").style.display), "none");
    assert.equal(await page.evaluate(() => window.__kg.welcome.hasSeenBefore()), true);
  }, { welcome: true });
});

test("the welcome popup mentions the Help button explicitly", async () => {
  await withPage(async (page) => {
    const text = await page.locator("#welcome-body").innerText();
    assert.match(text, /súgó|help/i);
  }, { welcome: true });
});

// --------------------------------------------------------------------------
// Help guide: opening, tabs, closing
// --------------------------------------------------------------------------

test("the toolbar Help button opens the Help guide on the usage tab by default", async () => {
  await withPage(async (page) => {
    await page.click("#btn-help");
    await page.waitForSelector("#help-overlay", { state: "visible" });
    assert.equal(await page.evaluate(() => window.__kg.help.getActiveTab()), "usage");
    assert.equal(await page.evaluate(() => document.getElementById("help-tab-usage").getAttribute("aria-selected")), "true");
    assert.equal(await page.evaluate(() => document.getElementById("help-panel-concepts").hidden), true);
  });
});

test("switching to the Concepts tab shows the glossary and hides the usage guide", async () => {
  await withPage(async (page) => {
    await page.click("#btn-help");
    await page.click("#help-tab-concepts");
    assert.equal(await page.evaluate(() => window.__kg.help.getActiveTab()), "concepts");
    assert.equal(await page.evaluate(() => document.getElementById("help-tab-concepts").getAttribute("aria-selected")), "true");
    assert.equal(await page.evaluate(() => document.getElementById("help-panel-usage").hidden), true);
    assert.equal(await page.evaluate(() => document.getElementById("help-panel-concepts").hidden), false);
  });
});

test("the Usage guide panel has real, non-empty content covering more than one topic", async () => {
  await withPage(async (page) => {
    await page.click("#btn-help");
    const headings = await page.evaluate(() => [...document.querySelectorAll("#help-panel-usage .help-usage-heading")].map((el) => el.textContent));
    assert.ok(headings.length >= 3, "expected several usage-guide sections, not just one");
    const text = await page.locator("#help-panel-usage").innerText();
    assert.match(text, /osztály|class/i);
  });
});

test("the Concepts glossary defines the core terms: class, relationship, rule, action", async () => {
  await withPage(async (page) => {
    await page.click("#btn-help");
    await page.click("#help-tab-concepts");
    // withPage() defaults to English (see its own comment) -- checking
    // against the Hungarian terms here would always fail against the
    // English-rendered content this default actually produces.
    const terms = await page.evaluate(() => [...document.querySelectorAll("#help-panel-concepts .help-term-name")].map((el) => el.textContent.toLowerCase()));
    assert.ok(terms.some((t) => t.includes("class")), "expected a Class term entry");
    assert.ok(terms.some((t) => t.includes("relationship")), "expected a Relationship term entry");
    assert.ok(terms.some((t) => t.includes("rule")), "expected a Rule term entry");
    assert.ok(terms.some((t) => t.includes("action")), "expected an Action term entry");
  });
});

test("Close button and clicking outside the Help dialog both close it", async () => {
  await withPage(async (page) => {
    await page.click("#btn-help");
    await page.click("#help-close");
    assert.equal(await page.evaluate(() => document.getElementById("help-overlay").style.display), "none");

    await page.click("#btn-help");
    await page.click("#help-overlay", { position: { x: 5, y: 5 } });
    assert.equal(await page.evaluate(() => document.getElementById("help-overlay").style.display), "none");
  });
});

// --------------------------------------------------------------------------
// Modal-stacking guard, i18n, and window.__kg
// --------------------------------------------------------------------------

test("opening the Domain Model dialog while the welcome popup is open is blocked (no stacked modals), and vice versa", async () => {
  await withPage(async (page) => {
    // Welcome is open by default on a fresh profile, visually covering the
    // toolbar too -- a real mouse click can't land on a covered button at
    // all (CSS already guarantees that on its own, nothing to test there),
    // and Playwright's force:true only skips its own actionability checks,
    // not the browser's real hit-testing, so it would still actually
    // resolve to the overlay itself as the click target. A programmatic
    // .click() invokes the button's own listener directly -- the same path
    // a keyboard Enter on a focused-but-covered button takes (focus isn't
    // trapped by this overlay, so Tab can reach it -- see isAnyModalOpen()'s
    // own comment in index.html), which is the real, previously-fixed
    // regression class (issue #77) this guards against, not mouse coverage.
    await page.evaluate(() => document.getElementById("btn-domain-model").click());
    // Blocked, so the guard never touches the inline style at all -- check
    // the resolved (CSS-default) display, not the inline attribute, which
    // stays "" rather than becoming the literal string "none".
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("domain-model-overlay")).display), "none");
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("welcome-overlay")).display), "flex");

    await page.click("#welcome-dismiss");
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    // Same reasoning as above -- domain-model-overlay now covers #btn-help
    // too, so a real click can't land on it either.
    await page.evaluate(() => document.getElementById("btn-help").click());
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById("help-overlay")).display), "none", "Help must not stack on top of an already-open dialog");
  }, { welcome: true });
});

test("the Help button's aria-label/tooltip and the whole dialog retranslate on a language toggle, including while Help is open", async () => {
  await withPage(async (page) => {
    const huLabel = await page.getAttribute("#btn-help", "aria-label");
    await page.click("#btn-help");
    const huUsageHeading = await page.locator("#help-panel-usage .help-usage-heading").first().textContent();

    await page.evaluate(() => window.__kg.lang.toggle());

    const enLabel = await page.getAttribute("#btn-help", "aria-label");
    const enUsageHeading = await page.locator("#help-panel-usage .help-usage-heading").first().textContent();
    assert.notEqual(huLabel, enLabel);
    assert.notEqual(huUsageHeading, enUsageHeading);
    // Still open, still on the same tab, just retranslated -- not reset.
    assert.equal(await page.evaluate(() => document.getElementById("help-overlay").style.display), "flex");
  });
});

test("the welcome popup's own content retranslates on a language toggle while it's still open", async () => {
  await withPage(async (page) => {
    const huTitle = await page.locator("#welcome-title").textContent();
    await page.evaluate(() => window.__kg.lang.toggle());
    const enTitle = await page.locator("#welcome-title").textContent();
    assert.notEqual(huTitle, enTitle);
    assert.equal(await page.evaluate(() => document.getElementById("welcome-overlay").style.display), "flex");
  }, { welcome: true });
});

test("window.__kg.welcome and window.__kg.help expose open/close/state without needing real clicks", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.welcome.close());
    assert.equal(await page.evaluate(() => window.__kg.welcome.isOpen()), false);

    await page.evaluate(() => window.__kg.help.open("concepts"));
    assert.equal(await page.evaluate(() => window.__kg.help.isOpen()), true);
    assert.equal(await page.evaluate(() => window.__kg.help.getActiveTab()), "concepts");
    assert.equal(await page.evaluate(() => document.getElementById("help-panel-concepts").hidden), false);

    await page.evaluate(() => window.__kg.help.setTab("usage"));
    assert.equal(await page.evaluate(() => window.__kg.help.getActiveTab()), "usage");

    await page.evaluate(() => window.__kg.help.close());
    assert.equal(await page.evaluate(() => window.__kg.help.isOpen()), false);
  });
});

test("opening/closing Help or the welcome popup never touches the graph or pushes history", async () => {
  await withPage(async (page) => {
    const before = await page.evaluate(() => JSON.stringify({ nodes: window.__kg.state.nodes, edges: window.__kg.state.edges }));
    const historyBefore = await page.evaluate(() => window.__kg.history.past.length);

    await page.click("#btn-help");
    await page.click("#help-tab-concepts");
    await page.click("#help-tab-usage");
    await page.click("#help-close");

    const after = await page.evaluate(() => JSON.stringify({ nodes: window.__kg.state.nodes, edges: window.__kg.state.edges }));
    const historyAfter = await page.evaluate(() => window.__kg.history.past.length);
    assert.equal(after, before);
    assert.equal(historyAfter, historyBefore);
  });
});

test("the Help toolbar button's tooltip stays fully within the viewport (regression: right-edge overflow, same class of bug the Review changes tooltip had)", async () => {
  await withPage(async (page) => {
    const viewport = page.viewportSize();
    await page.hover("#btn-help");
    await page.waitForTimeout(150);
    const box = await page.evaluate(() => {
      const el = document.getElementById("btn-help");
      const cs = getComputedStyle(el, "::after");
      const rect = el.getBoundingClientRect();
      // The pseudo-element itself can't be measured directly via
      // getBoundingClientRect, but its right edge is anchored flush to the
      // button's own right edge (left:auto; right:0) and its content is the
      // button's own data-tooltip text -- what matters here is simply that
      // the button itself (and therefore the tooltip's anchor point) is
      // fully on-screen, and that the tooltip rule doesn't center it (which
      // is what caused the original overflow).
      return { right: rect.right, tooltipLeft: cs.left, tooltipTransform: cs.transform };
    });
    assert.ok(box.right <= viewport.width, "the Help button itself must be on-screen");
    // Confirms the right-anchored (not centered) positioning fix is in place.
    const anchoring = await page.evaluate(() => getComputedStyle(document.getElementById("btn-help"), "::after").right);
    assert.equal(anchoring, "0px");
  });
});
