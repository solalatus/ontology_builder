// PERSONA CONFIRM-ONLY SHARE (persona-ablation DESIGN.md, Amendments 1 and 1a, check 3)
//
//   node tests/evals/persona-confirm-only.mjs                 # first paper + final itops
//   node tests/evals/persona-confirm-only.mjs --withAblation  # adds the ablation arm
//
// Offline, no API calls. For each itops run it takes the persona turns inside
// the class-and-relationship window (first turn whose apply_ontology_yaml call
// has a top-level `classes:` key, up to and including the last turn whose call
// has a top-level `relationships:` key; from tool-calls.md) and counts a turn
// as confirm-only when
//   (a) it introduces no gold term (class, relationship or property name in its
//       plain-word form, or an alias) not already present earlier in the
//       conversation, and
//   (b) it opens with an assent or is under 25 words.
// The ablation arm is read only with --withAblation, so the script can be
// tested on the other two arms without opening ablation artefacts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RUNS = ["run-01", "run-02", "run-03"];
const ARMS = {
  "first-paper": (r) => path.join(__dirname, "results", "runs", r),
  final: (r) => path.join(ROOT, "ontology_translation", "results", "final-scores", "runs", r, "itops"),
  ablation: (r) => path.join(ROOT, "ontology_translation", "results", "persona-ablation", "runs", r, "itops"),
};
const ASSENT = /^\W*(yes|yeah|yep|correct|right|exactly|that'?s right|that is right|sounds good|agreed)\b/i;

export function plainWords(id) {
  return id.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase().trim();
}

export function goldTerms(domainYamlPath) {
  const doc = yaml.load(fs.readFileSync(domainYamlPath, "utf8"));
  const terms = new Set();
  const add = (s) => { if (typeof s === "string" && s.trim().length >= 3) terms.add(s.trim().toLowerCase()); };
  for (const [name, c] of Object.entries(doc.classes || {})) {
    add(plainWords(name));
    for (const a of c?.aliases || []) add(a);
    for (const p of Object.keys(c?.properties || {})) add(plainWords(p));
  }
  for (const r of doc.relationships || []) { add(plainWords(r.name)); for (const a of r.aliases || []) add(a); }
  return [...terms];
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text, term) => new RegExp(`(^|[^a-z0-9])${escape(term)}([^a-z0-9]|$)`, "i").test(text);

/** Turn entries of a log file: [{turn, role, text}]. */
export function parseTurns(md) {
  return md.split(/^### Turn /m).slice(1).map((b) => {
    const nl = b.indexOf("\n");
    const m = b.slice(0, nl).match(/^(\d+)\s+\S+\s+(\S+)/);
    return m ? { turn: Number(m[1]), role: m[2], text: b.slice(nl + 1) } : null;
  }).filter(Boolean);
}

export function window(toolCallsMd) {
  let first = null, last = null;
  for (const e of parseTurns(toolCallsMd)) {
    const re = /Tool call: `apply_ontology_yaml`\*\*\s*```\s*(\{[\s\S]*?\})\s*```/g;
    let m;
    while ((m = re.exec(e.text))) {
      let y; try { y = JSON.parse(m[1]).yaml; } catch { continue; }
      if (typeof y !== "string") continue;
      if (first === null && /^classes:/m.test(y)) first = e.turn;
      if (/^relationships:/m.test(y)) last = e.turn;
    }
  }
  return { first, last };
}

export function confirmOnly(dir, terms) {
  const log = parseTurns(fs.readFileSync(path.join(dir, "conversation-log.md"), "utf8"));
  const { first, last } = window(fs.readFileSync(path.join(dir, "tool-calls.md"), "utf8"));
  if (first === null || last === null || last < first) return { first, last, turns: 0, confirmOnly: 0, share: null };
  let seen = "", turns = 0, confirm = 0;
  for (const e of log) {
    if (e.role === "persona" && e.turn >= first && e.turn <= last) {
      const introduces = terms.some((t) => has(e.text, t) && !has(seen, t));
      const words = e.text.trim().split(/\s+/).filter(Boolean).length;
      const brief = ASSENT.test(e.text.trim()) || words < 25;
      turns++;
      if (!introduces && brief) confirm++;
    }
    seen += "\n" + e.text;
  }
  return { first, last, turns, confirmOnly: confirm, share: turns ? confirm / turns : null };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const terms = goldTerms(path.join(ROOT, "ontology_translation", "domains", "itops", "reference.domain.yaml"));
  const arms = ["first-paper", "final", ...(process.argv.includes("--withAblation") ? ["ablation"] : [])];
  const out = {};
  for (const arm of arms) {
    out[arm] = RUNS.map((r) => ({ run: r, ...confirmOnly(ARMS[arm](r), terms) }));
    for (const x of out[arm]) console.log(`${arm} ${x.run}: window ${x.first}-${x.last}, persona turns ${x.turns}, confirm-only ${x.confirmOnly} (${x.share === null ? "n/a" : (100 * x.share).toFixed(1) + " %"})`);
  }
  const w = process.argv.find((a) => a.startsWith("--write="));
  if (w) fs.writeFileSync(w.slice(8), JSON.stringify({ terms: terms.length, arms: out }, null, 2) + "\n");
}
