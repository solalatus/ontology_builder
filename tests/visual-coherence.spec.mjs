import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// General layout/coherence checks, distinct from ui-polish.spec.mjs (which
// pins specific CSS values) and design-refresh.spec.mjs (which pins the
// 2026-08 color/grouping/badge refactor's own behavior). These instead hunt
// for the class of bug neither of those catches: two things visually on top
// of each other, something rendered off-screen or at zero size, or a
// container that no longer fits its content -- the kind of thing that only
// shows up as "this looks wrong," not as a wrong computed-style value.
//
// Written against real layout geometry (getBoundingClientRect() /
// boundingBox()) rather than pixel sampling wherever the question is
// "do these two things collide" -- matches this suite's existing bias
// toward asserting on the same values the browser's own layout engine
// computes (see tests/README.md's window.__kg section) rather than
// reading canvas/screenshot pixels except where nothing else can answer
// the question (e.g. theme.spec.mjs's fill-pixel check).

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function toolbarButtonBoxes(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll("#toolbar button")].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.display !== "none" && cs.visibility !== "hidden";
    });
    return nodes.map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.id, x: r.x, y: r.y, width: r.width, height: r.height };
    });
  });
}

// --------------------------------------------------------------------------
// #agent-panel-toggle vs #graph-title (regression: found via this task's
// own investigation -- the toggle is a fixed z-index:25 overlay always at
// page x:[0,40], above the toolbar's z-index:10, and covered the title's
// first ~28px at every viewport width and panel state before the fix.)
// --------------------------------------------------------------------------

test("the agent-panel toggle never overlaps the graph title, at a range of viewport widths", async () => {
  for (const width of [1400, 900, 480, 320]) {
    await withPage(async (page) => {
      const toggle = await page.locator("#agent-panel-toggle").boundingBox();
      const title = await page.locator("#graph-title").boundingBox();
      assert.ok(!intersects(toggle, title), `toggle and title overlap at width=${width}: toggle=${JSON.stringify(toggle)} title=${JSON.stringify(title)}`);
    }, { viewport: { width, height: 800 } });
  }
});

test("the agent-panel toggle still clears the graph title once the panel is expanded", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => window.__kg.agent.setExpanded(true));
    const toggle = await page.locator("#agent-panel-toggle").boundingBox();
    const title = await page.locator("#graph-title").boundingBox();
    assert.ok(!intersects(toggle, title));
  });
});

// --------------------------------------------------------------------------
// Toolbar: no overlaps, nothing collapsed to zero size, no horizontal
// page overflow -- across the range from a wide desktop down to a narrow
// phone width, where the 2026-08 grouping refactor made whole button
// groups (not individual buttons) the unit that wraps to a new line.
// --------------------------------------------------------------------------

test("no two toolbar buttons visually overlap, at any tested viewport width", async () => {
  for (const width of [1400, 900, 600, 480, 320]) {
    await withPage(async (page) => {
      const boxes = await toolbarButtonBoxes(page);
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          assert.ok(
            !intersects(boxes[i], boxes[j]),
            `#${boxes[i].id} overlaps #${boxes[j].id} at width=${width}`
          );
        }
      }
    }, { viewport: { width, height: 800 } });
  }
});

test("every visible toolbar button renders with a non-zero size, at any tested viewport width", async () => {
  for (const width of [1400, 900, 600, 480, 320]) {
    await withPage(async (page) => {
      const boxes = await toolbarButtonBoxes(page);
      assert.ok(boxes.length > 5, "expected the toolbar's usual button set to be present");
      for (const b of boxes) {
        assert.ok(b.width > 0 && b.height > 0, `#${b.id} rendered with zero size at width=${width}`);
      }
    }, { viewport: { width, height: 800 } });
  }
});

test("the toolbar never forces the page wider than the viewport, even wrapped across several lines", async () => {
  for (const width of [900, 480, 375, 320]) {
    await withPage(async (page) => {
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      assert.equal(scrollWidth, clientWidth, `page has horizontal overflow at width=${width}: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
    }, { viewport: { width, height: 800 } });
  }
});

// --------------------------------------------------------------------------
// Canvas overlays: the floating per-selection toolbar vs. the property-count
// badge introduced in the 2026-08 canvas-identity refactor. Both render near
// a selected node's top edge -- worth pinning that they don't collide.
// --------------------------------------------------------------------------

test("the floating selection toolbar doesn't overlap a selected node's property-count badge", async () => {
  await withPage(async (page) => {
    await addNodeViaDblClick(page, 400, 300, "Invoice");
    await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      n.properties = [{ id: "p1", name: "amount", type: "number", unit: "EUR", allowed: null }];
      window.__kg.markDirty();
      window.__kg.render();
    });

    const canvasBox = await page.locator("#canvas").boundingBox();
    await page.mouse.click(canvasBox.x + 400, canvasBox.y + 300);
    await page.waitForFunction(() => getComputedStyle(document.getElementById("sel-toolbar")).display !== "none");

    const selToolbarBox = await page.locator("#sel-toolbar").boundingBox();
    const badgeScreen = await page.evaluate(() => {
      const n = window.__kg.state.nodes[0];
      return window.__kg.worldToScreen(n.x + n.w, n.y);
    });
    // The badge itself is canvas-drawn, not a DOM element -- approximate
    // its footprint around the corner point drawNodes() actually paints it
    // at (see index.html's drawNodes(), badgeRadius sits well under 20px
    // in world units at any zoom level this test exercises).
    const badgeBox = {
      x: canvasBox.x + badgeScreen.x - 10,
      y: canvasBox.y + badgeScreen.y - 10,
      width: 20,
      height: 20,
    };
    assert.ok(!intersects(selToolbarBox, badgeBox), `sel-toolbar=${JSON.stringify(selToolbarBox)} badge~=${JSON.stringify(badgeBox)}`);
  });
});

// --------------------------------------------------------------------------
// Modal dialogs: must stay fully on-screen, including at a narrow viewport
// where the details/domain-model dialogs' own 90vw width leaves less
// headroom than on a wide desktop.
// --------------------------------------------------------------------------

async function assertDialogWithinViewport(page, dialogSelector) {
  const viewport = page.viewportSize();
  const box = await page.locator(dialogSelector).boundingBox();
  assert.ok(box.x >= 0, `${dialogSelector} starts left of the viewport: x=${box.x}`);
  assert.ok(box.y >= 0, `${dialogSelector} starts above the viewport: y=${box.y}`);
  assert.ok(box.x + box.width <= viewport.width + 1, `${dialogSelector} overflows the right edge: ${box.x + box.width} > ${viewport.width}`);
  assert.ok(box.y + box.height <= viewport.height + 1, `${dialogSelector} overflows the bottom edge: ${box.y + box.height} > ${viewport.height}`);
}

test("the confirm dialog stays fully within the viewport, including at a narrow width", async () => {
  for (const width of [1200, 360]) {
    await withPage(async (page) => {
      await addNodeViaDblClick(page, 100, 400, "Alpha"); // y=400 clears even the toolbar's wrapped height at the narrow 360px width tested below
      await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);
      await page.click("#btn-clear");
      await page.waitForSelector("#confirm-dialog");
      await assertDialogWithinViewport(page, "#confirm-dialog");
      await page.click("#confirm-cancel");
    }, { viewport: { width, height: 700 } });
  }
});

test("the class/relationship details dialog stays fully within the viewport, including at a narrow width", async () => {
  for (const width of [1200, 360]) {
    await withPage(async (page) => {
      await addNodeViaDblClick(page, 100, 400, "Invoice"); // y=400 clears even the toolbar's wrapped height at the narrow 360px width tested below
      const canvasBox = await page.locator("#canvas").boundingBox();
      await page.mouse.click(canvasBox.x + 100, canvasBox.y + 400);
      await page.click("#sel-details");
      await page.waitForSelector("#details-overlay", { state: "visible" });
      await assertDialogWithinViewport(page, "#details-dialog");
    }, { viewport: { width, height: 700 } });
  }
});

// --------------------------------------------------------------------------
// Graph title: long names must truncate within their own box, not stretch
// the toolbar or run into the next element.
// --------------------------------------------------------------------------

test("a very long graph name stays within the title's own max-width instead of stretching the toolbar", async () => {
  await withPage(async (page) => {
    await page.evaluate(() => {
      window.__kg.state.graphName = "A".repeat(200);
      document.getElementById("graph-title").textContent = window.__kg.state.graphName;
    });
    const titleBox = await page.locator("#graph-title").boundingBox();
    assert.ok(titleBox.width <= 260, `graph title exceeded its max-width: ${titleBox.width}px`);

    // And the button immediately after it must not have been pushed
    // off past where a same-line neighbor would sit -- i.e. this is
    // still one coherent row, not something that silently overflowed.
    const addNodeBox = await page.locator("#btn-add-node").boundingBox();
    assert.ok(!intersects(titleBox, addNodeBox));
  });
});
