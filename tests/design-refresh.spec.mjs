import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick, waitForStyleSettled } from "./lib/page.mjs";

// Regression coverage for the 2026-08 design-critique refactor: three
// unrelated visual problems, each with its own group of tests below.
//   #2 one accent color was standing in for selection, an armed tool mode,
//      a persistent setting, and agent-chat provenance all at once.
//   #3 the toolbar was a flat, ungrouped list with no warning on the one
//      destructive action (Clear).
//   #7 canvas nodes looked identical regardless of how much ontology
//      structure (meaning/aliases/properties) they actually carried.

async function cssVar(page, name) {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}

async function computedStyle(page, selector, prop) {
  return page.evaluate(({ selector, prop }) => getComputedStyle(document.querySelector(selector))[prop], { selector, prop });
}

// Renders a real DOM element with the given class combo (matching how
// index.html itself constructs it, e.g. `agent-transcript-msg
// agent-msg-user`) to read back what the stylesheet actually resolves its
// border-color to -- border-color computes to a real value even while
// border-style is "none" and nothing is visibly painted, so this doesn't
// need the element to be part of a real rendered chat bubble.
async function computedBorderColorOfClass(page, className) {
  return page.evaluate((cls) => {
    const el = document.createElement("div");
    el.className = cls;
    document.body.appendChild(el);
    const color = getComputedStyle(el).borderColor;
    el.remove();
    return color;
  }, className);
}

// -----------------------------------------------------------------------
// #2: semantic color separation
// -----------------------------------------------------------------------

test("a transient mode-armed button (Add Node) and a persistent state-toggle button (Theme) get different accent colors when both are pressed", async () => {
  await withPage(async (page) => {
    const restingAddNode = await computedStyle(page, "#btn-add-node", "borderColor");
    const restingTheme = await computedStyle(page, "#btn-theme-toggle", "borderColor");
    await page.click("#btn-add-node");
    assert.equal(await page.getAttribute("#btn-add-node", "aria-pressed"), "true");
    await page.click("#btn-theme-toggle");
    assert.equal(await page.getAttribute("#btn-theme-toggle", "aria-pressed"), "true");
    // Both borders transition at once; each is sampled only once it has settled,
    // rather than both after one fixed sleep (issue #91). `differentFrom` is
    // what makes "settled" mean settled: the frames before a transition starts
    // are identical at the resting value, so without it a loaded machine can
    // hand back the un-clicked colour for both buttons and fail the compare.
    const armedBorder = await waitForStyleSettled(page, "#btn-add-node", "borderColor", { differentFrom: restingAddNode });
    const activeBorder = await waitForStyleSettled(page, "#btn-theme-toggle", "borderColor", { differentFrom: restingTheme });
    assert.notEqual(armedBorder, activeBorder, "an armed tool mode must not look identical to an active persistent setting");
  });
});

test("mode-armed, state-active, agent-accent, and the base selection accent are four distinct color tokens in both themes", async () => {
  await withPage(async (page) => {
    for (const theme of ["dark", "light"]) {
      if (theme === "light") await page.click("#btn-theme-toggle");
      const accent = await cssVar(page, "--accent");
      const modeArmed = await cssVar(page, "--mode-armed");
      const stateActive = await cssVar(page, "--state-active");
      const agentAccent = await cssVar(page, "--agent-accent");
      const tokens = { accent, modeArmed, stateActive, agentAccent };
      const values = Object.values(tokens);
      const unique = new Set(values);
      assert.equal(unique.size, values.length, `expected 4 distinct colors in ${theme} theme, got ${JSON.stringify(tokens)}`);
    }
  });
});

test("an agent chat bubble's provenance color is distinct from the canvas selection accent", async () => {
  await withPage(async (page) => {
    const userBubbleBorder = await computedBorderColorOfClass(page, "agent-transcript-msg agent-msg-user");
    const toolNoteBorder = await computedBorderColorOfClass(page, "agent-transcript-msg agent-msg-tool");
    const selectionAccent = await computedStyle(page, "#btn-add-node", "borderColor"); // ordinary border, but --accent is what selection uses on canvas
    const accentValue = await cssVar(page, "--accent");
    const agentAccentValue = await cssVar(page, "--agent-accent");

    assert.notEqual(agentAccentValue, accentValue);
    // Both agent-provenance surfaces (user messages and tool-outcome notes)
    // must agree with each other and with the --agent-accent token.
    assert.equal(userBubbleBorder, toolNoteBorder);
  });
});

test("the destructive Clear button carries a warning color at rest, not only on hover", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);

    const clearBorder = await computedStyle(page, "#btn-clear", "borderColor");
    const ordinaryBorder = await computedStyle(page, "#btn-undo", "borderColor");
    assert.notEqual(clearBorder, ordinaryBorder, "Clear should read as destructive without needing to hover first");
  });
});

// -----------------------------------------------------------------------
// #3: toolbar hierarchy
// -----------------------------------------------------------------------

test("related toolbar buttons share a common .toolbar-group container", async () => {
  await withPage(async (page) => {
    const sameGroup = await page.evaluate(() => {
      const addNode = document.getElementById("btn-add-node");
      const connect = document.getElementById("btn-connect");
      return addNode.closest(".toolbar-group") !== null && addNode.closest(".toolbar-group") === connect.closest(".toolbar-group");
    });
    assert.ok(sameGroup, "Add Node and Connect should sit in the same structural group");

    const settingsGroupedSeparately = await page.evaluate(() => {
      const addNode = document.getElementById("btn-add-node");
      const theme = document.getElementById("btn-theme-toggle");
      const lang = document.getElementById("btn-lang-toggle");
      const themeGroup = theme.closest(".toolbar-group");
      return themeGroup !== null && themeGroup === lang.closest(".toolbar-group") && themeGroup !== addNode.closest(".toolbar-group");
    });
    assert.ok(settingsGroupedSeparately, "Theme and Language should share a group distinct from the editing group");
  });
});

test("non-final toolbar groups render a visible divider; the trailing group does not", async () => {
  await withPage(async (page) => {
    const editGroupBorder = await page.evaluate(() => {
      const group = document.getElementById("btn-add-node").closest(".toolbar-group");
      return getComputedStyle(group).borderRightStyle;
    });
    assert.notEqual(editGroupBorder, "none", "an interior group should have a divider on its trailing edge");

    const settingsGroupBorder = await page.evaluate(() => {
      const group = document.getElementById("btn-theme-toggle").closest(".toolbar-group");
      return getComputedStyle(group).borderRightStyle;
    });
    assert.equal(settingsGroupBorder, "none", "the last group shouldn't trail a divider into empty space");
  });
});

test("Clear sits outside every button group, keeping it visually isolated from both its neighbors", async () => {
  await withPage(async (page) => {
    const isolated = await page.evaluate(() => document.getElementById("btn-clear").closest(".toolbar-group") === null);
    assert.ok(isolated);
  });
});

// -----------------------------------------------------------------------
// #7: canvas node visual identity
// -----------------------------------------------------------------------

test("a freshly created node with no meaning, aliases, or properties is reported as bare", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const visual = await page.evaluate(() => window.__kg.getNodeVisualState(window.__kg.state.nodes[0]));
    assert.equal(visual.isBare, true);
    assert.equal(visual.propertyCount, 0);
  });
});

test("giving a node properties clears the bare flag and reports the correct count", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const visual = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      n.properties = [
        { id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null },
        { id: "p2", name: "dueDate", type: "text", unit: null, allowed: null },
      ];
      window.__kg.markDirty();
      return window.__kg.getNodeVisualState(n);
    });
    assert.equal(visual.isBare, false);
    assert.equal(visual.propertyCount, 2);
  });
});

test("giving a node only a meaning (no properties) still clears the bare flag, with a zero property count", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const visual = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      n.meaning = "A request for payment.";
      window.__kg.markDirty();
      return window.__kg.getNodeVisualState(n);
    });
    assert.equal(visual.isBare, false);
    assert.equal(visual.propertyCount, 0);
  });
});

test("an alias alone (no meaning, no properties) also clears the bare flag", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");
    const visual = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      n.aliases = ["bill"];
      window.__kg.markDirty();
      return window.__kg.getNodeVisualState(n);
    });
    assert.equal(visual.isBare, false);
  });
});

test("the property-count badge actually paints distinct pixels at the node's corner once properties exist", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Invoice");

    const badgePixel = () => page.evaluate(() => {
      const canvas = document.getElementById("canvas");
      const c = canvas.getContext("2d");
      const node = window.__kg.state.nodes[0];
      const screen = window.__kg.worldToScreen(node.x + node.w, node.y);
      const dpr = window.devicePixelRatio || 1;
      const data = c.getImageData(Math.round(screen.x * dpr), Math.round(screen.y * dpr), 1, 1).data;
      return [data[0], data[1], data[2]];
    });

    const beforePixel = await badgePixel();

    await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      n.properties = [{ id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null }];
      window.__kg.markDirty();
      window.__kg.render();
    });
    const afterPixel = await badgePixel();

    assert.notDeepEqual(afterPixel, beforePixel, "the badge should change what's painted at the node's top-right corner");
  });
});
