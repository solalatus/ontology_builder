"""Stage 2 of the compiler pipeline (issue #102): LLM semantic compilation
of a source IR (from extract.py) into `.domain.yaml` + a `translation.json`
provenance sidecar, via Azure OpenAI.

Everything here is built to be watched while it runs, not just waited on:
every call logs a structured JSONL event to `<out-dir>/run.log.jsonl`
*and* stdout, so `tail -f` (or the Monitor tool) shows live progress —
which run/pass is in flight, tokens used so far, running cost — for a
process that can take minutes and spends real money per call.

Nothing here calls the API unless you ask it to. `--dry-run` assembles the
exact prompts, prints an approximate cost estimate, and writes nothing that
costs money -- always run that first on a new domain.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import yaml

from env import load_azure_config
from source_manifest import load_manifest
from validate_domain import validate_domain

TOOLS_DIR = Path(__file__).resolve().parent
PROMPT_PATH = TOOLS_DIR / "prompts" / "compiler-prompt.md"

# There is deliberately one current prompt file, not a compiler-v1.md/
# compiler-v2.md/... lineage sitting in the repo -- past wording is
# recovered from git history (`git log -p -- <PROMPT_PATH>`), not from
# parallel files. `prompt_sha256()` is what actually pins a specific run to
# specific wording, recorded in run-manifest.json alongside a manifest's
# free-text `compiler.prompt_version` label.


def prompt_sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

# Azure OpenAI GPT-5.4 Global Standard, <=272K context (see the Aug-2026
# cost-estimate artifact this pipeline was budgeted from). Only used for the
# --dry-run preflight estimate and the post-call cost line in the log --
# never for anything that gates whether a call is made.
PRICE_PER_M_INPUT = 2.50
PRICE_PER_M_CACHED_INPUT = 0.25
PRICE_PER_M_OUTPUT = 15.00


def estimate_cost(prompt_tokens: int, completion_tokens: int, cached_tokens: int = 0) -> float:
    billed_input = max(prompt_tokens - cached_tokens, 0)
    return (
        billed_input / 1_000_000 * PRICE_PER_M_INPUT
        + cached_tokens / 1_000_000 * PRICE_PER_M_CACHED_INPUT
        + completion_tokens / 1_000_000 * PRICE_PER_M_OUTPUT
    )


def approx_tokens(text: str) -> int:
    """~4 chars/token is the standard rough heuristic for English/JSON-ish
    text; only used pre-flight where no real usage figure exists yet."""
    return max(1, len(text) // 4)


class RunLogger:
    """Appends one JSON object per line to run.log.jsonl and mirrors a
    human-readable version to stdout, so a long compile run can be tailed
    live instead of only inspected after it finishes."""

    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._fh = self.path.open("a", encoding="utf-8")

    def event(self, event_type: str, **fields) -> None:
        record = {"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "event": event_type, **fields}
        self._fh.write(json.dumps(record) + "\n")
        self._fh.flush()
        summary = " ".join(f"{k}={v}" for k, v in fields.items())
        print(f"[compile] {event_type} {summary}")

    def close(self) -> None:
        self._fh.close()


@dataclass
class CompileResult:
    domain_yaml: str
    translation: dict
    prompt_tokens: int
    completion_tokens: int
    cached_tokens: int


def build_user_prompt(source_ir: dict, manifest_id: str, scope_note: str | None, previous_chunks: list[str] | None) -> str:
    parts = [
        f"Domain id: {manifest_id}",
        (f"Domain scope note: {scope_note}" if scope_note else ""),
        "Source IR (deterministically extracted, JSON):",
        json.dumps(source_ir, indent=2, sort_keys=False),
    ]
    if previous_chunks:
        parts.append("Previously compiled chunks for this same domain (for continuity, do not repeat):")
        parts.extend(previous_chunks)
    return "\n\n".join(p for p in parts if p)


def _extract_json_object(text: str) -> dict:
    """The prompt asks for exactly one JSON object with no fences, but
    models occasionally wrap it in ```json anyway -- strip that defensively
    before falling back to a hard parse error."""
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.strip("`")
        if stripped.lower().startswith("json"):
            stripped = stripped[4:]
        stripped = stripped.strip()
    return json.loads(stripped)


def call_compiler(client, deployment: str, system_prompt: str, user_prompt: str, logger: RunLogger, run_label: str) -> CompileResult:
    logger.event("api_call_start", run=run_label, prompt_chars=len(system_prompt) + len(user_prompt))
    start = time.monotonic()
    try:
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
    except TypeError:
        # Older/incompatible SDK signature for response_format -- retry
        # without it rather than failing the whole run on that alone.
        response = client.chat.completions.create(
            model=deployment,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
    elapsed = time.monotonic() - start

    usage = getattr(response, "usage", None)
    prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
    completion_tokens = getattr(usage, "completion_tokens", 0) or 0
    cached_tokens = 0
    details = getattr(usage, "prompt_tokens_details", None)
    if details is not None:
        cached_tokens = getattr(details, "cached_tokens", 0) or 0

    content = response.choices[0].message.content
    parsed = _extract_json_object(content)
    cost = estimate_cost(prompt_tokens, completion_tokens, cached_tokens)
    logger.event(
        "api_call_end",
        run=run_label,
        seconds=round(elapsed, 1),
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        cached_tokens=cached_tokens,
        cost_usd=round(cost, 4),
    )
    return CompileResult(
        domain_yaml=parsed["domain_yaml"],
        translation=parsed["translation"],
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        cached_tokens=cached_tokens,
    )


def run_compile(
    source_ir_path: Path,
    manifest_path: Path,
    out_dir: Path,
    runs: int | None,
    scope_note: str | None,
    dry_run: bool,
) -> int:
    manifest = load_manifest(manifest_path)
    source_ir = json.loads(source_ir_path.read_text(encoding="utf-8"))
    system_prompt = PROMPT_PATH.read_text(encoding="utf-8")
    user_prompt = build_user_prompt(source_ir, manifest.id, scope_note, previous_chunks=None)
    run_count = runs if runs is not None else manifest.compiler_runs

    if dry_run:
        est_prompt_tokens = approx_tokens(system_prompt) + approx_tokens(user_prompt)
        # Output size is unknown pre-call; ~15K tokens/run is this pipeline's
        # own planning estimate for a 30-60 class target (see the cost
        # artifact) -- clearly an approximation, not a bound.
        est_completion_tokens = 15_000
        est_cost_per_run = estimate_cost(est_prompt_tokens, est_completion_tokens)
        print(f"[compile] DRY RUN -- {manifest.id}: {run_count} run(s) planned")
        print(f"[compile] DRY RUN -- ~{est_prompt_tokens} prompt tokens/run (char/4 heuristic)")
        print(f"[compile] DRY RUN -- approx cost/run ~${est_cost_per_run:.2f}, total ~${est_cost_per_run * run_count:.2f}")
        print("[compile] DRY RUN -- no API call made, nothing written")
        return 0

    azure_config = load_azure_config()
    missing = [k for k in ("endpoint", "api_key") if not azure_config[k]]
    if missing:
        print(f"[compile] ERROR: missing Azure config: {missing}. Set AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY.", file=sys.stderr)
        return 1

    from openai import AzureOpenAI  # imported here so --dry-run never requires the openai package to be importable-with-network

    client = AzureOpenAI(
        api_version=azure_config["api_version"],
        azure_endpoint=azure_config["endpoint"],
        api_key=azure_config["api_key"],
    )

    logger = RunLogger(out_dir / "run.log.jsonl")
    logger.event(
        "compile_start",
        domain=manifest.id,
        runs=run_count,
        deployment=azure_config["deployment"],
        prompt_version=manifest.compiler_prompt_version,
        prompt_sha256=prompt_sha256(system_prompt),
    )

    total_cost = 0.0
    run_manifest_entries = []
    try:
        for i in range(1, run_count + 1):
            run_label = f"run-{i}"
            result = call_compiler(client, azure_config["deployment"], system_prompt, user_prompt, logger, run_label)
            total_cost += estimate_cost(result.prompt_tokens, result.completion_tokens, result.cached_tokens)

            domain_yaml_path = out_dir / f"{run_label}.domain.yaml"
            translation_path = out_dir / f"{run_label}.translation.json"
            domain_yaml_path.write_text(result.domain_yaml, encoding="utf-8")
            translation_path.write_text(json.dumps(result.translation, indent=2), encoding="utf-8")

            report = validate_domain(yaml.safe_load(result.domain_yaml) or {})
            logger.event(
                "run_validated",
                run=run_label,
                ok=report.ok,
                error_count=len(report.errors),
                warning_count=len(report.issues) - len(report.errors),
            )
            run_manifest_entries.append(
                {
                    "run": run_label,
                    "domain_yaml": str(domain_yaml_path),
                    "translation": str(translation_path),
                    "prompt_tokens": result.prompt_tokens,
                    "completion_tokens": result.completion_tokens,
                    "cached_tokens": result.cached_tokens,
                    "structural_validation_ok": report.ok,
                    "structural_validation_errors": len(report.errors),
                }
            )
    finally:
        logger.event("compile_end", domain=manifest.id, total_cost_usd=round(total_cost, 4))
        logger.close()

    run_manifest_path = out_dir / "run-manifest.json"
    run_manifest_path.write_text(
        json.dumps(
            {
                "domain": manifest.id,
                "prompt_version": manifest.compiler_prompt_version,
                "prompt_sha256": prompt_sha256(system_prompt),
                "deployment": azure_config["deployment"],
                "api_version": azure_config["api_version"],
                "runs": run_manifest_entries,
                "total_estimated_cost_usd": round(total_cost, 4),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"[compile] {manifest.id}: done, {run_count} run(s), ~${total_cost:.4f} estimated cost -> {run_manifest_path}")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-ir", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--runs", type=int, default=None, help="override manifest.compiler.runs")
    parser.add_argument("--scope-note", type=str, default=None, help="free-text domain-scope guidance for the compiler")
    parser.add_argument("--dry-run", action="store_true", help="assemble prompts and estimate cost; no API call")
    args = parser.parse_args(argv)

    return run_compile(args.source_ir, args.manifest, args.out_dir, args.runs, args.scope_note, args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
