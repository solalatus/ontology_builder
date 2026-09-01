// VALIDATES (AND, WITH --write, SANITIZES) A SAVED RUN'S recovered-model.yaml
//
//   node tests/evals/validate-recovered-model.mjs <run-dir-or-file> [...]
//   node tests/evals/validate-recovered-model.mjs --write <run-dir-or-file> [...]
//
// Runs tests/evals/lib/modelSanitizer.mjs's checks against one or more
// already-saved `recovered-model.yaml` files (issue #140 -- see that
// module's own doc for what's detected and why). Report-only by default:
// prints every finding, exits 1 if any *strippable* (unambiguous) issue is
// present so this can gate CI/a pre-merge check without ever silently
// discarding advisory-only findings that need a human to actually look.
//
// --write applies sanitizeRecoveredModel(doc, {strip:true}) and rewrites the
// file in place with the strippable issues removed -- advisory issues are
// still printed (and still make the run visibly "not fully clean"), since
// nothing here is confident enough to auto-resolve them (see modelSanitizer.
// mjs's module doc on why "leftover"/"superseded"-flagged content is never
// auto-deleted). Deliberately NOT run against this repo's own already-
// committed real run artifacts under ontology_translation/results/ -- those
// are preserved byte-for-byte as the historical record of what the live
// interview actually produced (including its defects, which are themselves
// the evidence behind issues #140/#141), the same "never touched" principle
// rescore-saved-run.mjs's own module doc already applies to
// recovered-model.yaml. Point --write at a copy, a new run, or a test
// fixture, not at a committed run directory.
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { findModelIssues, sanitizeRecoveredModel, formatFindings } from "./lib/modelSanitizer.mjs";

function resolveModelPath(arg) {
  const abs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    const candidate = path.join(abs, "recovered-model.yaml");
    if (!fs.existsSync(candidate)) throw new Error(`no recovered-model.yaml in ${abs}`);
    return candidate;
  }
  if (!fs.existsSync(abs)) throw new Error(`no such file or directory: ${arg}`);
  return abs;
}

export function validateModelFile(modelPath, { write = false } = {}) {
  const doc = yaml.load(fs.readFileSync(modelPath, "utf8")) || {};
  if (!write) {
    return { modelPath, findings: findModelIssues(doc), removed: null };
  }
  const { model, findings, removed } = sanitizeRecoveredModel(doc, { strip: true });
  if (removed.classes.length || removed.relationships.length) {
    fs.writeFileSync(modelPath, yaml.dump(model, { lineWidth: -1, noRefs: true }));
  }
  return { modelPath, findings, removed };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rawArgs = process.argv.slice(2);
  const write = rawArgs.includes("--write");
  const targets = rawArgs.filter((a) => a !== "--write");
  if (!targets.length) {
    console.error("Usage: node tests/evals/validate-recovered-model.mjs [--write] <run-dir-or-recovered-model.yaml> [...]");
    console.error("Example: node tests/evals/validate-recovered-model.mjs ontology_translation/results/multi-domain/run-01/brick-hvac");
    process.exit(1);
  }
  let anyStrippableRemaining = false;
  for (const target of targets) {
    const modelPath = resolveModelPath(target);
    const { findings, removed } = validateModelFile(modelPath, { write });
    console.log(`\n${path.relative(process.cwd(), modelPath)}`);
    console.log(formatFindings(findings));
    if (write && removed) {
      const total = removed.classes.length + removed.relationships.length;
      console.log(total ? `-> stripped ${removed.classes.length} class(es), ${removed.relationships.length} relationship(s); file rewritten` : "-> nothing to strip; file unchanged");
    }
    const stillStrippable = write ? false : findings.some((f) => f.severity === "strip");
    if (stillStrippable) anyStrippableRemaining = true;
  }
  process.exit(anyStrippableRemaining ? 1 : 0);
}
