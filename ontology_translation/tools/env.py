"""Local secrets loader for ontology_translation/tools/*.py.

Mirrors tests/lib/env.mjs's convention exactly, so the two credential-loading
paths in this repo (JS live tests, Python translation tools) behave
identically: read the real environment first, fall back to a hand-parsed
`.env` at the repo root, and never throw just because that file is absent
(the normal case on most contributors' machines and always the case in CI).
No dependency added (no python-dotenv) just to read one optional file.
"""

from __future__ import annotations

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = REPO_ROOT / ".env"


def _parse_env_file(path: Path) -> dict:
    out = {}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return out
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        if key:
            out[key] = value
    return out


def load_env_key(name: str, default: str | None = None) -> str | None:
    """process.env-equivalent wins over .env, matching tests/lib/env.mjs."""
    if os.environ.get(name):
        return os.environ[name]
    parsed = _parse_env_file(ENV_PATH)
    return parsed.get(name, default)


def load_azure_config() -> dict:
    """Collects the four Azure OpenAI settings these tools need.

    Returns a dict with possibly-None values rather than raising, so callers
    (compile.py's --dry-run path in particular) can run without credentials
    and only fail at the point a real API call is actually attempted.
    """
    return {
        "endpoint": load_env_key("AZURE_OPENAI_ENDPOINT"),
        "api_key": load_env_key("AZURE_OPENAI_API_KEY"),
        "api_version": load_env_key("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
        "deployment": load_env_key("AZURE_OPENAI_DEPLOYMENT", "gpt-5.4"),
    }
