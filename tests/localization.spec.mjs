import { test } from "node:test";
import assert from "node:assert/strict";
import { withPage, addNodeViaDblClick } from "./lib/page.mjs";

// Unlike every other spec file, this one deliberately does NOT want the
// shared withPage() default of pinning English — it exists specifically to
// exercise the real default (English) and the toggle between languages.
// `lang: null` skips the pin so the app boots exactly as a real user would
// see it.
function withRealDefaultPage(fn) {
  return withPage(fn, { lang: null });
}

// The translation tests below start in Hungarian on purpose and toggle to
// English, so they pin Hungarian explicitly now that English is the default.
function withHungarianPage(fn) {
  return withPage(fn, { lang: "hu" });
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

test("defaults to English on a fresh load (no prior localStorage)", async () => {
  await withRealDefaultPage(async (page) => {
    assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Add Node");
    assert.equal(await page.locator("#graph-title").textContent(), "Untitled Graph");
    assert.equal(await langButtonText(page), "Language: English");
    assert.equal(await page.getAttribute("#btn-lang-toggle", "aria-pressed"), "true");
  });
});

test("toggling the language switches all static toolbar/dialog text, the <html> lang attribute, and back again", async () => {
  await withRealDefaultPage(async (page) => {
    await page.click("#btn-lang-toggle");
    assert.equal(await page.evaluate(() => document.documentElement.lang), "hu");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Csomópont hozzáadása");
    assert.equal(await langButtonText(page), "Nyelv: Magyar");
    assert.equal(await page.getAttribute("#btn-lang-toggle", "aria-pressed"), "false");

    await page.click("#btn-lang-toggle");
    assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Add Node");
    assert.equal(await page.locator("#btn-connect").textContent(), "Connect");
    assert.equal(await page.locator("#btn-autolayout").textContent(), "Auto-layout");
    assert.equal(await page.locator("#btn-undo").textContent(), "Undo");
    assert.equal(await page.locator("#btn-redo").textContent(), "Redo");
    assert.equal(await page.locator("#btn-save-version").textContent(), "Export");
    assert.equal(await page.locator("#btn-import-txt").textContent(), "Import");
    assert.equal(await page.locator("#btn-clear").textContent(), "Clear");
    assert.equal(await page.getAttribute("#btn-zoom-out", "aria-label"), "Zoom out");
    assert.equal(await page.getAttribute("#btn-zoom-in", "aria-label"), "Zoom in");
    assert.equal(await page.getAttribute("#graph-title", "title"), "Click to rename");
    assert.equal(await langButtonText(page), "Language: English");
    assert.equal(await page.getAttribute("#btn-lang-toggle", "aria-pressed"), "true");
  });
});

test("language choice persists across a reload", async () => {
  await withRealDefaultPage(async (page) => {
    await page.click("#btn-lang-toggle"); // -> hu
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "hu");

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__kg));

    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "hu");
    assert.equal(await page.evaluate(() => document.documentElement.lang), "hu");
    assert.equal(await page.locator("#btn-add-node").textContent(), "Csomópont hozzáadása");
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
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "en");
    await page.evaluate(() => window.__kg.lang.toggle());
    assert.equal(await page.evaluate(() => window.__kg.lang.get()), "hu");
    assert.equal(await langButtonText(page), "Nyelv: Magyar");
  });
});

test("an untitled graph's placeholder name tracks the current language, but a user-chosen name never gets translated", async () => {
  await withHungarianPage(async (page) => {
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

// The test above renames to a name that doesn't collide with either
// language's placeholder text. This one renames to the *literal* English
// placeholder string on purpose — "never touched" used to be inferred by
// string equality against that exact text, which couldn't tell this
// deliberate choice apart from having never been renamed at all.
test("renaming a graph to the literal placeholder text on purpose still survives a language toggle untranslated", async () => {
  await withHungarianPage(async (page) => {
    await page.click("#btn-lang-toggle"); // -> en, so the placeholder text and the chosen name are identical strings
    assert.equal(await page.locator("#graph-title").textContent(), "Untitled Graph");

    await page.click("#graph-title");
    await page.locator(".kg-inline-input").fill("Untitled Graph");
    await page.keyboard.press("Enter");

    await page.click("#btn-lang-toggle"); // -> hu
    assert.equal(await page.locator("#graph-title").textContent(), "Untitled Graph",
      "a deliberate rename to this exact text must not be mistaken for the untouched default and retranslated");
  });
});

test("canvas empty-state message and node/relation placeholders translate via the t() hook", async () => {
  await withHungarianPage(async (page) => {
    const huEmpty = await page.evaluate(() => window.__kg.lang.t("emptyCanvasMessage", window.__kg.lang.t("addNode")));
    assert.equal(huEmpty, 'A vászon üres — kattints a(z) "Csomópont hozzáadása" gombra a kezdéshez');

    await page.click("#btn-lang-toggle"); // -> en
    const enEmpty = await page.evaluate(() => window.__kg.lang.t("emptyCanvasMessage", window.__kg.lang.t("addNode")));
    assert.equal(enEmpty, 'Canvas is empty — use "Add Node" to begin');
  });
});

test("node placeholder is translated (Hungarian, then English)", async () => {
  await withHungarianPage(async (page) => {
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

test("relation placeholder is translated when connecting two nodes", async () => {
  await withHungarianPage(async (page) => {
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
  await withHungarianPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.waitForFunction(() => document.getElementById("btn-clear").disabled === false);

    await page.click("#btn-clear");
    assert.equal(
      await page.locator("#confirm-message").textContent(),
      "Törlöd a teljes modellt? Ez eltávolít 1 osztályt, 0 kapcsolatot, 0 kompetenciakérdést, 0 szabályt és 0 műveletet. Ez visszavonható a Visszavonás gombbal.",
    );
    assert.equal(await page.locator("#confirm-ok").textContent(), "Törlés");
    assert.equal(await page.locator("#confirm-cancel").textContent(), "Mégse");
    await page.click("#confirm-cancel");

    await page.click("#btn-lang-toggle"); // -> en
    await page.click("#btn-clear");
    assert.equal(
      await page.locator("#confirm-message").textContent(),
      "Clear the entire model? This removes 1 class, 0 relationships, 0 competency questions, 0 rules and 0 actions. This can be undone with the Undo button.",
    );
    assert.equal(await page.locator("#confirm-ok").textContent(), "Clear");
    assert.equal(await page.locator("#confirm-cancel").textContent(), "Cancel");
    await page.click("#confirm-cancel");
  });
});

test("the import summary message translates with correctly interpolated counts, in both languages", async () => {
  await withHungarianPage(async (page) => {
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

test("the Domain Model YAML import summary message translates with correctly interpolated counts, in both languages", async () => {
  await withHungarianPage(async (page) => {
    const yamlText = [
      "classes:",
      "  Alpha:",
      "    meaning: null",
      "    aliases: []",
      "    properties: {}",
      "relationships: []",
      "rules: {}",
      "actions: {}",
      "",
    ].join("\n");
    await dropText(page, yamlText, "import.domain.yaml");
    assert.equal(
      await page.locator("#import-summary").textContent(),
      "Egyesítés: 1 elem kerülne hozzáadásra, 0 meglévő elem frissülne a fájl értékeivel. Semmi nem törlődik.",
    );
    await page.click("#import-cancel");

    await page.click("#btn-lang-toggle"); // -> en
    await dropText(page, yamlText, "import.domain.yaml");
    assert.equal(
      await page.locator("#import-summary").textContent(),
      "Merge: 1 item(s) would be added, 0 existing item(s) would be updated with the file's values. Nothing is removed.",
    );
    await page.click("#import-cancel");
  });
});

test("the import dialog's Cancel/Replace/Merge button labels translate", async () => {
  await withHungarianPage(async (page) => {
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
  await withHungarianPage(async (page) => {
    await addNodeViaDblClick(page, 300, 300, "Alpha");
    await page.evaluate(() => window.__kg.actions.selectNode(window.__kg.state.nodes[0].id));

    assert.equal(await page.getAttribute("#sel-rename", "title"), "Átnevezés");
    assert.equal(await page.getAttribute("#sel-trash", "title"), "Törlés");

    await page.click("#btn-lang-toggle"); // -> en
    assert.equal(await page.getAttribute("#sel-rename", "title"), "Rename");
    assert.equal(await page.getAttribute("#sel-trash", "title"), "Delete");
  });
});
