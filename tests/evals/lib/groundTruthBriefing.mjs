import yaml from "js-yaml";

// Issue #133/E12 item 1 (external audit, root-cause fix): Finding A's leak
// wasn't only a prompting failure -- personaAgent.mjs's buildSystemPrompt
// embeds the raw `.domain.yaml` file text verbatim, inside a fenced yaml
// code block, directly in the persona's own system prompt. The model
// therefore has direct visual access to every raw internal identifier
// (AirHandlingUnit, hasBorrower, servesZone, ...) and can regurgitate one
// verbatim even when the wrapper prompt explicitly tells it not to --
// prompting alone caps how reliable "don't reveal the internal keys" can
// ever be when the internal keys are sitting right there in context.
//
// The actual descriptive content of `.domain.yaml` (meaning/definition
// prose, aliases, conditions, effects, competency questions) is already
// natural language -- only the dictionary KEYS (and a few reference VALUES,
// like a relationship's from/to or an action's input, which just repeat a
// class name) are raw camelCase/PascalCase compounds. This renders a
// version of the same document with every one of those raw identifiers
// replaced by its natural-language form, so there is no raw compound left
// anywhere in the text that reaches the model's context at all -- nothing
// to accidentally reveal, rather than something to remember not to reveal.

// Splits 'AirHandlingUnit' -> 'Air Handling Unit', 'hasBorrower' -> 'has
// Borrower'. A fifth small copy of this exact split (recoveryMetrics.mjs,
// groundTruthModel.mjs, leakDetector.mjs, and now here) -- see those files'
// own comments for why this is deliberately not shared across stages.
function splitCamelCase(s) {
  return String(s || "").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
}

// Every raw identifier this document defines: class names, each class's own
// property keys, relationship names, rule names, action names -- mapped to
// its natural-language form. Mirrors leakDetector.mjs's own
// collectRawIdentifiers walk of the same document shape, but builds a
// replacement map instead of a leak-candidate set (every identifier is
// relabeled here, including single-segment ones -- splitCamelCase is a
// no-op on those, so relabeling them is harmless, unlike leak detection
// where flagging them would be a false positive).
function buildIdentifierLabelMap(doc) {
  const map = new Map();
  const add = (id) => { if (id && !map.has(id)) map.set(id, splitCamelCase(id)); };
  for (const [className, c] of Object.entries((doc && doc.classes) || {})) {
    add(className);
    for (const propName of Object.keys((c && c.properties) || {})) add(propName);
  }
  // Issue #133/N3: a relationship's own `aliases:` entries are real raw
  // identifiers too -- skipped here previously, so an aliased identifier
  // (real example: iof-maintenance's "prescribedBy") never got relabeled
  // and could reach the persona's context verbatim, defeating this
  // renderer's whole purpose for exactly that identifier.
  for (const r of (doc && doc.relationships) || []) {
    if (r && r.name) add(r.name);
    for (const alias of (r && r.aliases) || []) add(alias);
  }
  for (const name of Object.keys((doc && doc.rules) || {})) add(name);
  for (const name of Object.keys((doc && doc.actions) || {})) add(name);
  return map;
}

// A single alternation regex matching any raw identifier as a whole word,
// longest-first so a longer identifier is never shadowed by a shorter one
// that happens to be one of its own substrings.
function buildReplacementRegex(map) {
  const ids = [...map.keys()].sort((a, b) => b.length - a.length).map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!ids.length) return null;
  return new RegExp(`\\b(${ids.join("|")})\\b`, "g");
}

// Real `.domain.yaml` files were found (fibo-loans, in this repo's own
// fixtures) to embed a raw identifier inline INSIDE an otherwise-prose
// sentence -- rule conditions and action verification text written like
// "loan hasBorrower Borrower" or "confirm prePaymentPenaltyTermMonths is
// present on the loan", not only as a dictionary key or an isolated
// from/to/input reference. A first version of this function only relabeled
// exact full-string matches (a relationship's from/to, an action's input)
// and left prose completely alone on the assumption prose never carries a
// raw compound -- that assumption was wrong, caught by a regression test
// scanning every real domain fixture rather than only a hand-written one.
// Whole-word substring replacement (not just full-string equality) is
// therefore applied inside every string, prose included.
function relabelString(str, map, regex) {
  if (!regex) return str;
  return str.replace(regex, (match) => map.get(match) || match);
}

// Recursively relabels dictionary KEYS (AirHandlingUnit: {...} ->
// "Air Handling Unit": {...}) and every raw-identifier occurrence inside
// string VALUES, whether the whole value is just a class-name reference
// (`from: AirHandlingUnit`) or the identifier is embedded inline within a
// longer natural-language sentence.
function relabel(node, map, regex) {
  if (Array.isArray(node)) return node.map((item) => relabel(item, map, regex));
  if (node && typeof node === "object") {
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[map.has(key) ? map.get(key) : key] = relabel(value, map, regex);
    }
    return out;
  }
  if (typeof node === "string") return relabelString(node, map, regex);
  return node;
}

// Takes the raw `.domain.yaml` file text and returns a natural-language
// version of the same document, still YAML-shaped (same nesting, same
// prose, same aliases/allowed values/conditions), with every raw internal
// identifier replaced by its natural-language label.
//
// Issue #133/N7a (independent audit of this same fix): a document that
// failed to parse used to be returned UNCHANGED -- fail-open, meaning a
// parse failure silently handed the raw, un-rendered text (every raw
// identifier still in it) straight to the persona's context, restoring the
// exact leak this function exists to close. Throws instead: a briefing
// that can't be rendered is not a run worth spending on, and the caller
// (personaAgent.mjs's buildSystemPrompt) should fail the run loudly rather
// than silently run it undefended.
export function renderNaturalLanguageBriefing(rawYamlText) {
  let doc;
  try {
    doc = yaml.load(rawYamlText);
  } catch (err) {
    throw new Error(`renderNaturalLanguageBriefing: ground truth YAML failed to parse -- refusing to fall back to the raw (un-rendered, leak-exposing) text: ${err.message}`);
  }
  if (!doc || typeof doc !== "object") {
    throw new Error("renderNaturalLanguageBriefing: parsed ground truth is not a document object -- refusing to fall back to the raw (un-rendered, leak-exposing) text");
  }
  const map = buildIdentifierLabelMap(doc);
  const regex = buildReplacementRegex(map);
  const relabeled = relabel(doc, map, regex);
  return yaml.dump(relabeled, { lineWidth: 100, noRefs: true });
}
