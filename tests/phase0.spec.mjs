import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage } from "./lib/page.mjs";

test("loads with camera at identity, no console/page errors", async () => {
  await withPage(async (page) => {
    const camera = await page.evaluate(() => window.__kg.camera);
    assert.equal(camera.scale, 1);
    assert.equal(camera.panX, 0);
    assert.equal(camera.panY, 0);
  });
});

test("drag-pan updates camera.panX/panY by the drag delta", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 80, cy - 40, { steps: 5 });
    await page.mouse.up();
    const camera = await page.evaluate(() => window.__kg.camera);
    assert.ok(Math.abs(camera.panX - -80) < 2, `panX ~ -80, got ${camera.panX}`);
    assert.ok(Math.abs(camera.panY - -40) < 2, `panY ~ -40, got ${camera.panY}`);
  });
});

test("wheel zoom over the canvas increases camera.scale", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -300);
    const camera = await page.evaluate(() => window.__kg.camera);
    assert.ok(camera.scale > 1, `expected scale > 1, got ${camera.scale}`);
  });
});

test("zoom in/out buttons move camera.scale in the expected direction", async () => {
  await withPage(async (page) => {
    await page.click("#btn-zoom-in");
    const scale1 = await page.evaluate(() => window.__kg.camera.scale);
    assert.ok(scale1 > 1, `expected scale > 1 after zoom-in, got ${scale1}`);
    await page.click("#btn-zoom-out");
    await page.click("#btn-zoom-out");
    const scale2 = await page.evaluate(() => window.__kg.camera.scale);
    assert.ok(scale2 < scale1, `expected scale to decrease, got ${scale2} vs ${scale1}`);
  });
});

test("window resize keeps the canvas filling its container", async () => {
  await withPage(async (page) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await page.waitForTimeout(50);
    const canvasSize = await page.evaluate(() => {
      const c = document.getElementById("canvas");
      return { w: c.clientWidth, h: c.clientHeight };
    });
    assert.equal(canvasSize.w, 900);
    assert.ok(canvasSize.h > 0 && canvasSize.h <= 600);
  });
});

test("wheel zoom in the opposite direction decreases camera.scale", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 300); // positive deltaY = zoom out
    const camera = await page.evaluate(() => window.__kg.camera);
    assert.ok(camera.scale < 1, `expected scale < 1, got ${camera.scale}`);
  });
});

test("zoomAt clamps to MIN_SCALE/MAX_SCALE regardless of how extreme the requested factor is", async () => {
  await withPage(async (page) => {
    const maxed = await page.evaluate(() => {
      window.__kg.zoomAt(100, 100, 1e9);
      return window.__kg.camera.scale;
    });
    assert.equal(maxed, 100, "expected MAX_SCALE clamp");

    const mined = await page.evaluate(() => {
      window.__kg.zoomAt(100, 100, 1e-9);
      return window.__kg.camera.scale;
    });
    assert.equal(mined, 0.01, "expected MIN_SCALE clamp");
  });
});

test("zoomAt keeps the world point under the cursor fixed after zooming", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => {
      const sx = 300, sy = 200;
      const before = window.__kg.screenToWorld(sx, sy);
      window.__kg.zoomAt(sx, sy, 2.5);
      const after = window.__kg.screenToWorld(sx, sy);
      return { before, after };
    });
    assert.ok(Math.abs(result.before.x - result.after.x) < 1e-9,
      `world x under cursor should stay fixed across a zoom: ${result.before.x} vs ${result.after.x}`);
    assert.ok(Math.abs(result.before.y - result.after.y) < 1e-9,
      `world y under cursor should stay fixed across a zoom: ${result.before.y} vs ${result.after.y}`);
  });
});

test("zooming in then by the exact inverse factor returns to (very nearly) the original scale", async () => {
  await withPage(async (page) => {
    const result = await page.evaluate(() => {
      const original = window.__kg.camera.scale;
      window.__kg.zoomAt(200, 200, 2);
      window.__kg.zoomAt(200, 200, 0.5);
      return { original, final: window.__kg.camera.scale };
    });
    assert.ok(Math.abs(result.original - result.final) < 1e-9,
      `expected round-trip scale stability, got ${result.original} vs ${result.final}`);
  });
});

test("a two-finger pinch gesture zooms via the same mechanism as wheel/buttons (pointerType: touch)", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    const initialScale = await page.evaluate(() => window.__kg.camera.scale);

    await page.evaluate(({ x, y }) => {
      const canvas = document.getElementById("canvas");
      const pe = (type, id, cx, cy) =>
        new PointerEvent(type, { pointerId: id, pointerType: "touch", clientX: cx, clientY: cy, bubbles: true });
      // Two fingers start close together, then spread apart — a pinch-out
      // gesture, which should zoom in exactly like scrolling the wheel up.
      canvas.dispatchEvent(pe("pointerdown", 1, x - 40, y));
      canvas.dispatchEvent(pe("pointerdown", 2, x + 40, y));
      canvas.dispatchEvent(pe("pointermove", 1, x - 150, y));
      canvas.dispatchEvent(pe("pointermove", 2, x + 150, y));
      canvas.dispatchEvent(pe("pointerup", 1, x - 150, y));
      canvas.dispatchEvent(pe("pointerup", 2, x + 150, y));
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

    const scale = await page.evaluate(() => window.__kg.camera.scale);
    assert.ok(scale > initialScale, `expected a pinch-out gesture to zoom in, got ${scale} vs ${initialScale}`);
  });
});

test("a pinch-in gesture (fingers moving together) zooms out", async () => {
  await withPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    const initialScale = await page.evaluate(() => window.__kg.camera.scale);

    await page.evaluate(({ x, y }) => {
      const canvas = document.getElementById("canvas");
      const pe = (type, id, cx, cy) =>
        new PointerEvent(type, { pointerId: id, pointerType: "touch", clientX: cx, clientY: cy, bubbles: true });
      canvas.dispatchEvent(pe("pointerdown", 1, x - 150, y));
      canvas.dispatchEvent(pe("pointerdown", 2, x + 150, y));
      canvas.dispatchEvent(pe("pointermove", 1, x - 30, y));
      canvas.dispatchEvent(pe("pointermove", 2, x + 30, y));
      canvas.dispatchEvent(pe("pointerup", 1, x - 30, y));
      canvas.dispatchEvent(pe("pointerup", 2, x + 30, y));
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });

    const scale = await page.evaluate(() => window.__kg.camera.scale);
    assert.ok(scale < initialScale, `expected a pinch-in gesture to zoom out, got ${scale} vs ${initialScale}`);
  });
});
