import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, waitForComputedStyle, waitForStyleSettled, settle } from "./lib/page.mjs";

// Round 3 of the 2026-08 design work: five user-reported items, each paired
// with both a visual/token assertion and a functional one where relevant.
//   1. Custom tooltips for zoom in/out/fit-view, and a visually emphasized
//      one for the agent-panel ("chat") toggle.
//   2. Fit-to-view was cutting a node's top edge off under the toolbar.
//   3/4. Covered separately in tests/edge-interaction-safety.spec.mjs
//      (dragging an edge's label to reposition it; dragging an edge must
//      never delete it).
//   5. More design emphasis on the Domain Model toolbar entry point.
//   + a mid-request addendum: Theme/Language moved into the same toolbar
//     group as the zoom controls, "since that fits my screen better."

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
async function computedStyle(page, selector, prop) {
  return page.evaluate(({ selector, prop }) => getComputedStyle(document.querySelector(selector))[prop], { selector, prop });
}
async function pseudoStyle(page, selector, pseudo, prop) {
  return page.evaluate(({ selector, pseudo, prop }) => getComputedStyle(document.querySelector(selector), pseudo)[prop], { selector, pseudo, prop });
}

// --------------------------------------------------------------------------
// #1: tooltips
// --------------------------------------------------------------------------

test("zoom in/out/fit-view show a tooltip on hover, hidden at rest", async () => {
  await withPage(async (page) => {
    for (const id of ["btn-zoom-out", "btn-zoom-in", "btn-fit-view"]) {
      const restOpacity = await pseudoStyle(page, `#${id}`, "::after", "opacity");
      assert.equal(restOpacity, "0", `#${id}'s tooltip should be invisible at rest`);

      await page.hover(`#${id}`);
      // Waits for the transition to finish rather than guessing at 150ms --
      // see waitForComputedStyle's own comment for why the guess flaked.
      await waitForComputedStyle(page, `#${id}`, "opacity", "1", { pseudo: "::after" });

      const content = await pseudoStyle(page, `#${id}`, "::after", "content");
      assert.notEqual(content, "none", `#${id}'s tooltip must have real text`);
      assert.notEqual(content, '""');
    }
  });
});

test("zoom tooltips track the active language", async () => {
  await withPage(async (page) => {
    assert.equal(await page.getAttribute("#btn-zoom-in", "data-tooltip"), "Zoom in");
    await page.click("#btn-lang-toggle");
    assert.equal(await page.getAttribute("#btn-zoom-in", "data-tooltip"), "Nagyítás");
  });
});

test("the agent (chat) toggle's tooltip is visible and visually emphasized, distinct from an ordinary tooltip's neutral color", async () => {
  await withPage(async (page) => {
    const restOpacity = await pseudoStyle(page, "#agent-panel-toggle", "::after", "opacity");
    assert.equal(restOpacity, "0");

    await page.hover("#agent-panel-toggle");
    await waitForComputedStyle(page, "#agent-panel-toggle", "opacity", "1", { pseudo: "::after" });

    const chatTooltipColor = await pseudoStyle(page, "#agent-panel-toggle", "::after", "color");
    const zoomTooltipColor = await pseudoStyle(page, "#btn-fit-view", "::after", "color");
    assert.notEqual(chatTooltipColor, zoomTooltipColor, "the chat toggle's tooltip should read as visually distinct, not just another neutral tooltip");

    const agentAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--agent-accent").trim());
    const probeColor = await page.evaluate((hex) => {
      const probe = document.createElement("div");
      probe.style.color = hex;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    }, agentAccent);
    assert.equal(chatTooltipColor, probeColor, "the chat tooltip's emphasis should be the same --agent-accent used for Helper Agent provenance elsewhere");
  });
});

test("the chat tooltip stays fully on-screen instead of clipping off the left edge", async () => {
  // The toggle sits flush against the viewport's left edge (x:0) -- the
  // same geometry that made #graph-title collide with this exact button
  // before an earlier fix (visual-coherence.spec.mjs). A naively centered
  // tooltip would have the same problem.
  await withPage(async (page) => {
    await page.hover("#agent-panel-toggle");
    await waitForComputedStyle(page, "#agent-panel-toggle", "opacity", "1", { pseudo: "::after" });
    const left = await page.evaluate(() => {
      const btn = document.getElementById("agent-panel-toggle");
      return parseFloat(getComputedStyle(btn, "::after").left);
    });
    assert.ok(left >= 0, `chat tooltip's left offset (${left}) would clip off the viewport edge`);
  });
});

test("removing the native title tooltip from the chat toggle doesn't remove its accessible name", async () => {
  // The custom data-tooltip is decorative; aria-label is what assistive
  // tech actually reads, and must still be present now that `title` (a
  // weaker, redundant signal once aria-label exists) was dropped to avoid
  // a native tooltip showing up doubled alongside the custom one.
  await withPage(async (page) => {
    assert.equal(await page.getAttribute("#agent-panel-toggle", "title"), null);
    assert.equal(await page.getAttribute("#agent-panel-toggle", "aria-label"), "Helper agent");
  });
});

// --------------------------------------------------------------------------
// #2: fit-to-view no longer clips content under the toolbar
// --------------------------------------------------------------------------

test("fit-to-view never places a node's top edge under the toolbar", async () => {
  for (const width of [1400, 480]) { // 480 forces the toolbar to wrap onto extra rows, growing its height
    await withPage(async (page) => {
      await addNodeViaDblClick(page, 300, 300, "Alpha");
      await settle(page, () => page.click("#btn-fit-view"));

      const nodeTopScreen = await page.evaluate(() => {
        const n = window.__kg.state.nodes[0];
        return window.__kg.worldToScreen(n.x, n.y).y;
      });
      const canvasBox = await page.locator("#canvas").boundingBox();
      const nodeTopPageY = canvasBox.y + nodeTopScreen;
      const toolbarBottom = await page.evaluate(() => document.getElementById("toolbar").getBoundingClientRect().bottom);

      assert.ok(nodeTopPageY >= toolbarBottom - 1, `at width=${width}, node's top edge (${nodeTopPageY}) is under the toolbar (bottom ${toolbarBottom})`);
    }, { viewport: { width, height: 800 } });
  }
});

test("fit-to-view still centers content reasonably (not pushed entirely to one edge) once the toolbar is accounted for", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await settle(page, () => page.click("#btn-fit-view"));

    const nodeScreen = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      const topLeft = window.__kg.worldToScreen(n.x, n.y);
      const bottomRight = window.__kg.worldToScreen(n.x + n.w, n.y + n.h);
      return { top: topLeft.y, bottom: bottomRight.y, left: topLeft.x, right: bottomRight.x };
    });
    const canvasBox = await page.locator("#canvas").boundingBox();
    // Comfortably within the canvas on every side, not hugging an edge.
    assert.ok(nodeScreen.left > 20 && nodeScreen.right < canvasBox.width - 20);
    assert.ok(nodeScreen.top > 20 && nodeScreen.bottom < canvasBox.height - 20);
  });
});

// --------------------------------------------------------------------------
// Toolbar reorg: zoom + theme + language share one area now
// --------------------------------------------------------------------------

test("zoom controls and Theme/Language now share one toolbar group, with no divider between them", async () => {
  await withPage(async (page) => {
    const sameGroup = await page.evaluate(() => {
      const zoomIn = document.getElementById("btn-zoom-in");
      const theme = document.getElementById("btn-theme-toggle");
      const lang = document.getElementById("btn-lang-toggle");
      const zoomGroup = zoomIn.closest(".toolbar-group");
      return zoomGroup !== null && zoomGroup === theme.closest(".toolbar-group") && zoomGroup === lang.closest(".toolbar-group");
    });
    assert.ok(sameGroup, "zoom, theme, and language should all sit in the same .toolbar-group");
  });
});

test("the combined zoom/theme/language group is still the toolbar's trailing group (no dangling divider)", async () => {
  await withPage(async (page) => {
    const borderStyle = await page.evaluate(() => {
      const group = document.getElementById("btn-theme-toggle").closest(".toolbar-group");
      return getComputedStyle(group).borderRightStyle;
    });
    assert.equal(borderStyle, "none");
  });
});

test("zoom buttons keep their own tighter internal spacing within the combined group", async () => {
  await withPage(async (page) => {
    const gaps = await page.evaluate(() => {
      const zoomOut = document.getElementById("btn-zoom-out").getBoundingClientRect();
      const zoomIn = document.getElementById("btn-zoom-in").getBoundingClientRect();
      const theme = document.getElementById("btn-theme-toggle").getBoundingClientRect();
      return {
        withinZoom: zoomIn.left - zoomOut.right,
        zoomToTheme: theme.left - document.getElementById("btn-fit-view").getBoundingClientRect().right,
      };
    });
    assert.ok(gaps.withinZoom < gaps.zoomToTheme, "gap between zoom buttons should be tighter than the gap from the zoom cluster to Theme");
  });
});

// --------------------------------------------------------------------------
// #5: Domain Model button emphasis
// --------------------------------------------------------------------------

test("the Domain Model button has a persistent accent border, distinct from an ordinary toolbar button", async () => {
  await withPage(async (page) => {
    const domainModelBorder = await computedStyle(page, "#btn-domain-model", "borderColor");
    const ordinaryBorder = await computedStyle(page, "#btn-autolayout", "borderColor");
    assert.notEqual(domainModelBorder, ordinaryBorder);

    const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim());
    const probeColor = await page.evaluate((hex) => {
      const probe = document.createElement("div");
      probe.style.borderColor = hex;
      probe.style.borderStyle = "solid";
      probe.style.borderWidth = "1px";
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).borderColor;
      probe.remove();
      return rgb;
    }, accent);
    assert.equal(domainModelBorder, probeColor, "should be the same --accent used for the Domain Model dialog's own top border (round 2, #6) -- a deliberate visual thread, not an arbitrary color");
  });
});

test("the Domain Model button's emphasis holds in both themes", async () => {
  await withPage(async (page) => {
    const darkBorder = await computedStyle(page, "#btn-domain-model", "borderColor");
    await page.click("#btn-theme-toggle");
    // `differentFrom` matters here: the border animates (see #toolbar
    // button's transition), and the frames between the theme swap and the
    // transition actually starting read as a perfectly stable dark value.
    const lightBorder = await waitForStyleSettled(page, "#btn-domain-model", "borderColor", { differentFrom: darkBorder });
    assert.notEqual(darkBorder, lightBorder, "the accent token differs between themes, so the button's border should too");
  });
});

test("clicking the emphasized Domain Model button still opens the dialog correctly", async () => {
  // Functional pairing: the new class must not have disturbed the button's
  // own click handler or the dialog's own accent-border treatment.
  await withPage(async (page) => {
    await page.click("#btn-domain-model");
    await page.waitForSelector("#domain-model-overlay", { state: "visible" });
    assert.equal(await computedStyle(page, "#domain-model-dialog", "borderTopWidth"), "3px");
  });
});
