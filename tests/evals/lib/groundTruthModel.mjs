import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_PATH = path.resolve(__dirname, "..", "fixtures", "itops_mtsr.yaml");

export function loadRawFixtureText() {
  return fs.readFileSync(FIXTURE_PATH, "utf8");
}

// A predicate whose *target* is a pure record-keeping datatype (identifier,
// uri) is exactly the kind of field the app's own baked howto doc
// (AGENT_KNOWLEDGE in index.html) tells the agent to skip: "Do not include
// technical fields that users never ask about." Scoring these as recall
// failures would penalize the agent for correctly following its own
// instructions -- a real domain interview surfaces "what severity is this"
// or "who owns this service", not "what is this record's internal
// identifier field called". This is the one deliberate edit to the ground
// truth the user asked for ("modify the yaml based on the handbook, skip
// what is needed") -- implemented as a documented, auditable filter rule
// over the untouched fixture, not a hand-trimmed copy of the YAML that
// could silently drift from the canonical source.
function isRecoverableProperty(predicate) {
  return !(predicate.kind !== "object" && (predicate.to === "identifier" || predicate.to === "uri"));
}

function normalizeLabel(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Builds the normalized comparison structure used by recoveryMetrics.mjs.
// classes: id -> { id, label, aliases: string[] (normalized, includes label) }
// relationships: [{ id, label, fromClassId, toClassId }]  (object-kind predicates)
// properties: [{ id, label, classId, kind, targetId, allowedValues: string[]|null }]
//   (datatype/controlled-value predicates that survive the filter above)
// valueSets: id -> { label, values: string[] }
export function loadGroundTruthModel({ includeAllProperties = false } = {}) {
  const doc = yaml.load(loadRawFixtureText());

  const classes = {};
  for (const [id, c] of Object.entries(doc.classes || {})) {
    const aliases = new Set([normalizeLabel(c.label)]);
    for (const a of c.aliases || []) aliases.add(normalizeLabel(a));
    classes[id] = { id, label: c.label, aliases: [...aliases] };
  }

  const valueSets = {};
  for (const [id, v] of Object.entries(doc.valueSets || {})) {
    valueSets[id] = { label: v.label, values: (v.values || []).map(String) };
  }

  const relationships = [];
  const properties = [];
  for (const [id, p] of Object.entries(doc.predicates || {})) {
    if (p.kind === "object") {
      if (!classes[p.from] || !classes[p.to]) continue; // predicate targets a non-class (shouldn't happen, defensive)
      relationships.push({ id, label: p.label, fromClassId: p.from, toClassId: p.to });
    } else {
      if (!classes[p.from]) continue;
      if (!includeAllProperties && !isRecoverableProperty(p)) continue;
      const allowedValues = p.kind === "controlled-value" && valueSets[p.to] ? valueSets[p.to].values : null;
      properties.push({ id, label: p.label, classId: p.from, kind: p.kind, targetId: p.to, allowedValues });
    }
  }

  return { classes, relationships, properties, valueSets, metadata: doc.metadata || {} };
}
