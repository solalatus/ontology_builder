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


# --- One provider choice for every model call (issue #183) -------------------
#
# The same resolution as tests/lib/llmProvider.mjs, so one .env change moves
# the JS live tests/evals and these tools together:
#   LLM_PROVIDER  openai | azure | bedrock; without it, Azure if
#                 AZURE_OPENAI_ENDPOINT is set, else Bedrock if
#                 AWS_BEARER_TOKEN_BEDROCK is, else OpenAI.
#   LLM_MODEL     the model for every call, else the provider's own variable
#                 (AZURE_OPENAI_DEPLOYMENT / BEDROCK_MODEL), else gpt-5.4 in
#                 the provider's naming.
# Bedrock goes through bedrock-mantle, as the app does.

PROVIDERS = ("openai", "azure", "bedrock")
DEFAULT_BEDROCK_REGION = "us-east-1"
DEFAULT_MODEL = "gpt-5.4"


def resolve_llm_provider() -> str:
    explicit = (load_env_key("LLM_PROVIDER") or load_env_key("EVAL_PROVIDER") or "").strip().lower()
    if explicit:
        if explicit not in PROVIDERS:
            raise ValueError(f"LLM_PROVIDER must be one of {', '.join(PROVIDERS)}; got {explicit!r}")
        return explicit
    if load_env_key("AZURE_OPENAI_ENDPOINT"):
        return "azure"
    if load_env_key("AWS_BEARER_TOKEN_BEDROCK"):
        return "bedrock"
    return "openai"


def bedrock_mantle_base_url(region: str) -> str:
    return f"https://bedrock-mantle.{region}.api.aws"


def normalize_bedrock_endpoint(raw: str | None) -> str | None:
    """A pasted '.../openai/v1' or '.../v1' base URL, trimmed to its host root."""
    trimmed = (raw or "").strip().rstrip("/")
    for suffix in ("/openai/v1", "/v1"):
        if trimmed.endswith(suffix):
            trimmed = trimmed[: -len(suffix)].rstrip("/")
            break
    return trimmed or None


def bedrock_chat_path(model: str) -> str:
    """Closed-weight GPT models are served under /openai/v1, others under /v1."""
    lowered = model.lower()
    return "/openai/v1" if lowered.startswith("openai.gpt-") and not lowered.startswith("openai.gpt-oss") else "/v1"


def model_id_for(provider: str, openai_name: str) -> str:
    if provider == "bedrock" and "." not in openai_name.split("-")[0]:
        return f"openai.{openai_name}"
    return openai_name


def load_llm_config() -> dict:
    """Provider, credentials and model for these tools' calls.

    Same contract as load_azure_config: possibly-None values, never raises
    for missing credentials, so --dry-run works without any. The model is
    under "deployment", the name every caller already reads.
    """
    provider = resolve_llm_provider()
    model = load_env_key("LLM_MODEL")
    if provider == "azure":
        config = load_azure_config()
        if model:
            config["deployment"] = model
        config.update(provider="azure", region=None)
        return config
    if provider == "bedrock":
        region = load_env_key("AWS_REGION") or load_env_key("AWS_DEFAULT_REGION") or DEFAULT_BEDROCK_REGION
        return {
            "provider": "bedrock",
            "endpoint": normalize_bedrock_endpoint(load_env_key("BEDROCK_ENDPOINT")) or bedrock_mantle_base_url(region),
            "api_key": load_env_key("AWS_BEARER_TOKEN_BEDROCK"),
            "api_version": None,
            "region": region,
            "deployment": model or load_env_key("BEDROCK_MODEL") or model_id_for("bedrock", DEFAULT_MODEL),
        }
    return {
        "provider": "openai",
        "endpoint": "https://api.openai.com",
        "api_key": load_env_key("OPENAI_API_KEY"),
        "api_version": None,
        "region": None,
        "deployment": model or DEFAULT_MODEL,
    }


_CREDENTIAL_NAMES = {
    "openai": "OPENAI_API_KEY",
    "azure": "AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY",
    "bedrock": "AWS_BEARER_TOKEN_BEDROCK",
}


def missing_llm_config(config: dict) -> str | None:
    """None when usable, else a sentence naming what to set."""
    missing = [k for k in ("endpoint", "api_key") if not config.get(k)]
    if not missing:
        return None
    return f"missing {config['provider']} config: {missing}. Set {_CREDENTIAL_NAMES[config['provider']]}."


def make_llm_client(config: dict):
    """An OpenAI SDK client for the configured provider.

    Every caller uses client.chat.completions.create(model=config["deployment"],
    ...), which reads the same on all three: on Azure the model is the
    deployment name, on Bedrock the Bedrock model id.
    """
    from openai import AzureOpenAI, OpenAI  # imported here so --dry-run never needs the package

    if config["provider"] == "azure":
        return AzureOpenAI(api_version=config["api_version"], azure_endpoint=config["endpoint"], api_key=config["api_key"])
    if config["provider"] == "bedrock":
        return OpenAI(api_key=config["api_key"], base_url=config["endpoint"] + bedrock_chat_path(config["deployment"]))
    return OpenAI(api_key=config["api_key"])
