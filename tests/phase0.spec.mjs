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
