import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "..", "..", ".env");

// Minimal .env parser (KEY=VALUE per line, '#' comments, blank lines
// ignored) -- no dependency added just to read one optional local secrets
// file. Never throws: a missing .env is the normal case (this repo's own
// CI/most contributors' machines don't have one), so callers always get an
// object back, just possibly without the key they asked for.
function parseEnvFile(filePath) {
  const out = {};
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    return out;
  }
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

// process.env wins over .env, so a real CI secret (if this ever runs
// there) is never shadowed by a stray local file.
export function loadEnvKey(name) {
  if (process.env[name]) return process.env[name];
  const parsed = parseEnvFile(ENV_PATH);
  return parsed[name] || null;
}
