import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Round 2 of the 2026-08 design critique: the four findings intentionally
// left out of the first pass (tests/design-refresh.spec.mjs) as bigger or
// more subjective -- #1 (no distinctive visual identity), #5 (three
// unreconciled button/icon languages), #6 (the value-prop dialogs have no
// more visual weight than a plain confirm box), #8 (the toolbar and the
// agent panel read as two separate systems). Each group below pairs a
// visual/token assertion (did the styling actually change, and only where
// intended) with a functional one (does the feature the styling sits on
// top of still work) -- stability was the explicit ask for this round, not
// just a fresh coat of paint.

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
function contains(outer, inner) {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height;
}
async function computedStyle(page, selector, prop) {
  return page.evaluate(({ selector, prop }) => getComputedStyle(document.querySelector(selector))[prop], { selector, prop });
}

// --------------------------------------------------------------------------
// #1: a deliberate typographic identity (--font-display), spent only on
// the graph title and dialog titles -- not diluted across body/button text.
// --------------------------------------------------------------------------

// getComputedStyle(document.documentElement).getPropertyValue("--font-display")
// returns the *raw* CSS text of the custom property (e.g. quotes kept on
// every font name); an element's own computed `fontFamily` is the browser's
// normalized serialization of that same value (e.g. quotes dropped from
// single-word names like Consolas). Comparing the two directly is comparing
// different serializations of the same value, not proof they differ --
// this instead reads --font-display through a throwaway element so both
// sides go through identical normalization.
async function computedDisplayFont(page) {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.fontFamily = "var(--font-display)";
    document.body.appendChild(probe);
    const font = getComputedStyle(probe).fontFamily;
    probe.remove();
    return font;
  });
}

test("the graph title and dialog titles use the display font; ordinary buttons and body text do not", async () => {
  await withPage(async (page) => {
    const displayFont = await computedDisplayFont(page);
    assert.ok(displayFont.length > 0);

    const titleFont = await computedStyle(page, "#graph-title", "fontFamily");
    assert.equal(titleFont, displayFont);

    const buttonFont = await computedStyle(page, "#btn-add-node", "fontFamily");
    assert.notEqual(buttonFont, displayFont, "ordinary toolbar buttons should not have picked up the display font too");
  });
});

test("a modal's title uses the display font once one is open", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const canvasBox = await page.locator("#canvas").boundingBox();
    await page.mouse.click(canvasBox.x + 300, canvasBox.y + 300);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });

    const displayFont = await computedDisplayFont(page);
    const titleFont = await computedStyle(page, "#details-title", "fontFamily");
    assert.equal(titleFont, displayFont);
  });
});

test("a very long graph name still renders (and stays editable) with the display font applied", async () => {
  // Functional pairing for the #1 typography change: a monospace stack
  // measures text differently from the system-ui stack it replaced on this
  // element, so the rename flow (not just the max-width clamp already
  // covered by visual-coherence.spec.mjs) needs to still work end-to-end.
  await withPage(async (page) => {
    await page.click("#graph-title");
    await page.waitForSelector(".kg-inline-input");
    await page.locator(".kg-inline-input").fill("A".repeat(80));
    await page.keyboard.press("Enter");
    await page.waitForSelector(".kg-inline-input", { state: "detached" });
    assert.equal(await page.evaluate(() => window.__kg.state.graphName), "A".repeat(80));
    assert.equal(await page.locator("#graph-title").textContent(), "A".repeat(80));
  });
});

// --------------------------------------------------------------------------
// #5: the agent-panel toggle's icon (an inline SVG line-icon, replacing a
// single colored emoji) matches the monochrome currentColor language
// #sel-toolbar's icons already use, and still carries an accessible name.
// --------------------------------------------------------------------------

test("the agent-panel toggle renders a monochrome SVG icon, not the old emoji glyph", async () => {
  await withPage(async (page) => {
    const info = await page.evaluate(() => {
      const btn = document.getElementById("agent-panel-toggle");
      const svg = btn.querySelector("svg");
      return {
        hasSvg: Boolean(svg),
        svgColor: svg ? getComputedStyle(svg).color : null,
        buttonColor: getComputedStyle(btn).color,
        // trim() so the SVG's own whitespace-only text nodes don't count
        visibleText: btn.textContent.trim(),
      };
    });
    assert.ok(info.hasSvg, "expected an inline <svg> icon inside the toggle button");
    assert.equal(info.visibleText, "", "no leftover emoji/text glyph should remain alongside the SVG");
    assert.equal(info.svgColor, info.buttonColor, "the icon should inherit currentColor from the button, matching the rest of the monochrome icon set");
  });
});

test("the SVG icon renders fully inside the toggle button's own bounds, at both viewport extremes", async () => {
  for (const width of [1400, 320]) {
    await withPage(async (page) => {
      const buttonBox = await page.locator("#agent-panel-toggle").boundingBox();
      const svgBox = await page.locator("#agent-panel-toggle svg").boundingBox();
      assert.ok(contains(buttonBox, svgBox), `icon overflows its button at width=${width}: button=${JSON.stringify(buttonBox)} svg=${JSON.stringify(svgBox)}`);
    }, { viewport: { width, height: 800 } });
  }
});

test("the toggle's accessible name (aria-label) tracks the active language, in sync with its title tooltip", async () => {
  await withPage(async (page) => {
    assert.equal(await page.getAttribute("#agent-panel-toggle", "aria-label"), "Helper agent");
    assert.equal(await page.getAttribute("#agent-panel-toggle", "title"), "Helper agent");

    await page.click("#btn-lang-toggle");
    assert.equal(await page.getAttribute("#agent-panel-toggle", "aria-label"), "Segéd ügynök");
    assert.equal(await page.getAttribute("#agent-panel-toggle", "title"), "Segéd ügynök");
  });
});

test("clicking the toggle still opens and closes the agent panel after the icon swap", async () => {
  await withPage(async (page) => {
    assert.equal(await page.evaluate(() => window.__kg.agent.isExpanded()), false);
    await page.click("#agent-panel-toggle");
    assert.equal(await page.evaluate(() => window.__kg.agent.isExpanded()), true);
    await page.click("#agent-panel-toggle");
    assert.equal(await page.evaluate(() => window.__kg.agent.isExpanded()), false);
  });
});

// --------------------------------------------------------------------------
// #6: the complex editor dialogs (.details-dialog, shared by Class/
// Relationship Details and Domain Model) get a distinct accent top border;
// plain dialogs (confirm/import/agent-connect) don't.
// --------------------------------------------------------------------------

test("the details dialog gets a thicker, accent-colored top border than a plain confirm dialog", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const canvasBox = await page.locator("#canvas").boundingBox();
    await page.mouse.click(canvasBox.x + 300, canvasBox.y + 300);
    await page.click("#sel-details");
    await page.waitForSelector("#details-overlay", { state: "visible" });

    const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
    const detailsTopWidth = await computedStyle(page, "#details-dialog", "borderTopWidth");
    const detailsTopColor = await computedStyle(page, "#details-dialog", "borderTopColor");
    assert.equal(detailsTopWidth, "3px");

    // borderTopColor resolves to rgb(...); compare against the accent
    // token resolved the same way instead of a literal hex string, so
    // this stays correct across both themes without hardcoding a color.
    const expectedAccentRgb = await page.evaluate((hex) => {
      const probe = document.createElement("div");
      probe.style.color = hex;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    }, accent);
    assert.equal(detailsTopColor, expectedAccentRgb);

    await page.click("#details-cancel");
    await addNodeViaDblClick(page, 500, 300, "Second");
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);
    await page.click("#btn-clear");
    await page.waitForSelector("#confirm-dialog");
    const confirmTopWidth = await computedStyle(page, "#confirm-dialog", "borderTopWidth");
    assert.notEqual(confirmTopWidth, "3px", "a plain confirm dialog should not pick up the editor dialogs' accent border");
    await page.click("#confirm-cancel");
  });
});

test("the domain model dialog (the other consumer of .details-dialog) also gets the accent top border, and remains fully functional", async () => {
  // Functional pairing: proves the new border rule (which touches the
  // shared .details-dialog class, not a one-off id) didn't regress the
  // dialog's own scrolling body/fixed footer split, or its Save flow.
  await withPage(async (page) => {
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });

    const topWidth = await computedStyle(page, "#domain-model-dialog", "borderTopWidth");
    assert.equal(topWidth, "3px");

    await page.click("#domain-model-add-rule");
    const ruleCountBefore = await page.locator(".domain-model-rule-card").count();
    assert.equal(ruleCountBefore, 1);
    // An unnamed card is a draft-in-progress, not a real rule yet --
    // saveDomainModelDialog() correctly drops it, so give it a name for
    // this check to actually exercise "a real rule survives Save".
    await page.locator(".dm-rule-name").fill("Test rule");
    await page.click("#domain-model-save");
    await page.waitForSelector("#domain-model-overlay", { state: "hidden" });
    const rules = await page.evaluate(() => window.__kg.state.rules.length);
    assert.equal(rules, 1);
  });
});

// --------------------------------------------------------------------------
// #8: the agent toggle now shares the same hover-lift grammar (translateY
// + a deeper shadow) as #toolbar's own buttons, on top of already sharing
// their color tokens -- one more piece of "these are the same app."
// --------------------------------------------------------------------------

test("the agent toggle lifts on hover the same way toolbar buttons do", async () => {
  await withPage(async (page) => {
    const restTransform = await computedStyle(page, "#agent-panel-toggle", "transform");
    const restShadow = await computedStyle(page, "#agent-panel-toggle", "boxShadow");

    await page.hover("#agent-panel-toggle");
    await page.waitForTimeout(200); // let the transition finish, matching this suite's existing pattern for transition-backed assertions

    const hoverTransform = await computedStyle(page, "#agent-panel-toggle", "transform");
    const hoverShadow = await computedStyle(page, "#agent-panel-toggle", "boxShadow");

    assert.notEqual(hoverTransform, restTransform, "expected a translateY lift on hover");
    assert.notEqual(hoverShadow, restShadow, "expected a deeper shadow on hover");
  });
});
