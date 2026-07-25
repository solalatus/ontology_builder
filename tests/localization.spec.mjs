import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Unlike every other spec file, this one deliberately does NOT want the
// shared withPage() default of pinning English — it exists specifically to
// exercise the real default (Hungarian) and the toggle between languages.
// `lang: null` skips the pin so the app boots exactly as a real user would
// see it.
function withRealDefaultPage(fn) {
  return withPage(fn, { lang: null });
}

async function langButtonText(page) {
  return page.locator("#btn-lang-toggle").textContent();
}

async function dropText(page, text, filename = "import.txt") {
  await page.evaluate(({ t, name }) => {
    const dt = new DataTransfer();
    const file = new File([t], name, { type: "text/plain" });
    dt.items.add(file);
    const canvas = document.getElementById("canvas");
    canvas.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, { t: text, name: filename });
  await page.waitForSelector("#import-overlay", { state: "visible" });
}

test("defaults to Hungarian on a fresh load (no prior localStorage)", async () => {
  await withRealDefaultPage(async (page) => {
    assert.equal(await page.evaluate(() => document.documentElement.lang), "hu");
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "hu");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Csomópont hozzáadása");
    assert.equal(await page.locator("#graph-title").textContent(), "Névtelen gráf");
    assert.equal(await langButtonText(page), "Nyelv: Magyar");
    assert.equal(await page.getAttribute("#btn-lang-toggle", "aria-pressed"), "false");
  });
});

test("toggling the language switches all static toolbar/dialog text, the <html> lang attribute, and back again", async () => {
  await withRealDefaultPage(async (page) => {
    await page.click("#btn-lang-toggle");
    assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Add Node");
    assert.equal(await page.locator("#btn-add-group").textContent(), "Add Group");
    assert.equal(await page.locator("#btn-connect").textContent(), "Connect");
    assert.equal(await page.locator("#btn-autolayout").textContent(), "Auto-layout");
    assert.equal(await page.locator("#btn-undo").textContent(), "Undo");
    assert.equal(await page.locator("#btn-redo").textContent(), "Redo");
    assert.equal(await page.locator("#btn-save-version").textContent(), "Save Version");
    assert.equal(await page.locator("#btn-import-txt").textContent(), "Import from TXT");
    assert.equal(await page.locator("#btn-clear").textContent(), "Clear");
    assert.equal(await page.getAttribute("#btn-zoom-out", "aria-label"), "Zoom out");
    assert.equal(await page.getAttribute("#btn-zoom-in", "aria-label"), "Zoom in");
    assert.equal(await page.getAttribute("#graph-title", "title"), "Click to rename");
    assert.equal(await langButtonText(page), "Language: English");
    assert.equal(await page.getAttribute("#btn-lang-toggle", "aria-pressed"), "true");

    await page.click("#btn-lang-toggle");
    assert.equal(await page.evaluate(() => document.documentElement.lang), "hu");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Csomópont hozzáadása");
    assert.equal(await langButtonText(page), "Nyelv: Magyar");
    assert.equal(await page.getAttribute("#btn-lang-toggle", "aria-pressed"), "false");
  });
});

test("language choice persists across a reload", async () => {
  await withRealDefaultPage(async (page) => {
    await page.click("#btn-lang-toggle"); // -> en
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en");

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));

    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en");
    assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Add Node");
  });
});

test("toggling language is not an undoable graph action — it never touches the undo/redo stack", async () => {
  await withRealDefaultPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    const before = await page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));

    await page.click("#btn-lang-toggle");
    await page.click("#btn-lang-toggle");

    const after = await page.evaluate(() => ({ past: window.__kg.history.past.length, future: window.__kg.history.future.length }));
    assert.deepEqual(after, before);
  });
});

test("the window.__kg.lang test hook mirrors the toggle button's behavior", async () => {
  await withRealDefaultPage(async (page) => {
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "hu");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en");
    assert.equal(await langButtonText(page), "Language: English");
  });
});

test("an untitled graph's placeholder name tracks the current language, but a user-chosen name never gets translated", async () => {
  await withRealDefaultPage(async (page) => {
    assert.equal(await page.locator("#graph-title").textContent(), "Névtelen gráf");
    await page.click("#btn-lang-toggle"); // -> en
    assert.equal(await page.locator("#graph-title").textContent(), "Untitled Graph", "still-untitled placeholder should retranslate");

    await page.click("#graph-title");
    await page.locator(".kg-inline-input").fill("My Real Graph");
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#graph-title").textContent(), "My Real Graph");

    await page.click("#btn-lang-toggle"); // -> hu
    assert.equal(await page.locator("#graph-title").textContent(), "My Real Graph", "a user-chosen name must never be auto-translated");
  });
});

test("canvas empty-state message and node/group/relation placeholders translate via the t() hook", async () => {
  await withRealDefaultPage(async (page) => {
    const huEmpty = await page.evaluate(() => window.__kg.lang.t("emptyCanvasMessage", window.__kg.lang.t("addNode")));
    assert.equal(huEmpty, 'A vászon üres — kattints a(z) "Csomópont hozzáadása" gombra a kezdéshez');

    await page.click("#btn-lang-toggle"); // -> en
    const enEmpty = await page.evaluate(() => window.__kg.lang.t("emptyCanvasMessage", window.__kg.lang.t("addNode")));
    assert.equal(enEmpty, 'Canvas is empty — use "Add Node" to begin');
  });
});

test("node placeholder is translated (Hungarian default, then English)", async () => {
  await withRealDefaultPage(async (page) => {
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.dblclick(box.x + 300, box.y + 300);
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "Csomópont neve");
    await page.keyboard.press("Escape");

    await page.click("#btn-lang-toggle"); // -> en
    await page.mouse.dblclick(box.x + 500, box.y + 500);
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "Node label");
    await page.keyboard.press("Escape");
  });
});

test("group placeholder is translated (Hungarian default, then English)", async () => {
  await withRealDefaultPage(async (page) => {
    await page.click("#btn-add-group");
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 300, box.y + 300);
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "Csoport neve");
    await page.keyboard.press("Escape");

    await page.click("#btn-lang-toggle"); // -> en
    await page.click("#btn-add-group");
    await page.mouse.click(box.x + 500, box.y + 500);
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "Group label");
    await page.keyboard.press("Escape");
  });
});

test("relation placeholder is translated when connecting two nodes", async () => {
  await withRealDefaultPage(async (page) => {
    await addNodeViaDblClick(page, 200, 200, "Alpha");
    await addNodeViaDblClick(page, 500, 200, "Beta");

    await page.evaluate(() => window.__kg.actions.setMode("connect"));
    const box = await page.locator("#canvas").boundingBox();
    await page.mouse.click(box.x + 200, box.y + 200);
    await page.mouse.click(box.x + 500, box.y + 200);
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "kapcsolat neve");
    await page.keyboard.press("Escape");

    await page.click("#btn-lang-toggle"); // -> en
    await page.evaluate(() => window.__kg.actions.setMode("connect"));
    await page.mouse.click(box.x + 200, box.y + 200);
    await page.mouse.click(box.x + 500, box.y + 200);
    assert.equal(await page.locator(".kg-inline-input").getAttribute("placeholder"), "relation label");
    await page.keyboard.press("Escape");
  });
});

test("the Clear confirm dialog message and button label translate", async () => {
  await withRealDefaultPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);

    await page.click("#btn-clear");
    assert.equal(
      await page.locator("#confirm-message").textContent(),
      "Törlöd az egész gráfot? Ez eltávolítja az összes csomópontot és élt. Ez visszavonható a Visszavonás gombbal.",
    );
    assert.equal(await page.locator("#confirm-ok").textContent(), "Törlés");
    assert.equal(await page.locator("#confirm-cancel").textContent(), "Mégse");
    await page.click("#confirm-cancel");

    await page.click("#btn-lang-toggle"); // -> en
    await page.click("#btn-clear");
    assert.equal(
      await page.locator("#confirm-message").textContent(),
      "Clear the entire graph? This removes all nodes and edges. This can be undone with the Undo button.",
    );
    assert.equal(await page.locator("#confirm-ok").textContent(), "Clear");
    assert.equal(await page.locator("#confirm-cancel").textContent(), "Cancel");
    await page.click("#confirm-cancel");
  });
});

test("the import summary message translates with correctly interpolated counts, in both languages", async () => {
  await withRealDefaultPage(async (page) => {
    await dropText(page, "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relates to");
    assert.equal(
      await page.locator("#import-summary").textContent(),
      "Egyesítés: 2 csomópont és 1 él kerülne hozzáadásra. Semmi nem törlődik.",
    );
    await page.click("#import-cancel");

    await page.click("#btn-lang-toggle"); // -> en
    await dropText(page, "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relates to");
    assert.equal(
      await page.locator("#import-summary").textContent(),
      "Merge: 2 node(s) and 1 edge(s) would be added. Nothing is ever removed.",
    );
    await page.click("#import-cancel");
  });
});

test("the import dialog's Cancel/Replace/Merge button labels translate", async () => {
  await withRealDefaultPage(async (page) => {
    await dropText(page, "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relates to");
    assert.equal(await page.locator("#import-cancel").textContent(), "Mégse");
    assert.equal(await page.locator("#import-replace").textContent(), "Csere");
    assert.equal(await page.locator("#import-merge").textContent(), "Egyesítés");
    await page.click("#import-cancel");

    await page.click("#btn-lang-toggle"); // -> en
    await dropText(page, "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relates to");
    assert.equal(await page.locator("#import-cancel").textContent(), "Cancel");
    assert.equal(await page.locator("#import-replace").textContent(), "Replace");
    assert.equal(await page.locator("#import-merge").textContent(), "Merge");
    await page.click("#import-cancel");
  });
});

test("the selection toolbar's Rename/Toggle-direction/Delete titles translate", async () => {
  await withRealDefaultPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.actions.selectNode(window.__kg.state.nodes[0].id));

    assert.equal(await page.getAttribute("#sel-rename", "title"), "Átnevezés");
    assert.equal(await page.getAttribute("#sel-trash", "title"), "Törlés");

    await page.click("#btn-lang-toggle"); // -> en
    assert.equal(await page.getAttribute("#sel-rename", "title"), "Rename");
    assert.equal(await page.getAttribute("#sel-trash", "title"), "Delete");
  });
});
