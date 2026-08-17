"""Read/write source-manifest.yaml -- the per-domain reproducibility record
required by the epic (issue #101): exact upstream ontology/version, source
URL, SHA-256 of the downloaded source, and compiler run parameters.

Shape (see issue #102):

    id: brick-hvac
    source_url: https://...
    source_version: v1.4.4
    source_sha256: <hex digest, pinned after first verified fetch>
    scope:
      roots: [...]            # IRIs or label substrings extract.py scopes to
    compiler:
      prompt_version: compiler-prompt
      runs: 3

`compiler.prompt_version` is a free-text label recorded for context, not a
filename selector -- compile.py always loads the single current
`prompts/compiler-prompt.md` and pins the run to its exact wording via a
content hash (see compile.py's `prompt_sha256()`); past wording is
recovered from git history, not from multiple prompt files.

This module only reads/writes/validates the manifest structure; fetch.py
owns actually downloading and checksumming the source file.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import yaml

REQUIRED_TOP_LEVEL = ("id", "source_url", "scope", "compiler")
REQUIRED_COMPILER = ("prompt_version", "runs")


class ManifestError(ValueError):
    """Raised for a structurally invalid source-manifest.yaml."""


@dataclass
class SourceManifest:
    id: str
    source_url: str
    scope_roots: list[str]
    compiler_prompt_version: str
    compiler_runs: int
    source_version: str | None = None
    source_sha256: str | None = None
    # Was written into every manifest as documentation of what a domain was
    # actually scoped with, but extract.py's CLI never read it -- only a
    # separate, easy-to-forget --max-depth flag controlled the real BFS
    # depth, silently defaulting to unlimited when omitted. Found for real
    # re-running the Brick HVAC pipeline from a clean slate: the exact same
    # manifest, same source, same roots produced 1622 classes instead of the
    # originally-accepted 81, because the CLI invocation this time (correctly,
    # by the manifest's own documented contract) didn't separately repeat
    # --max-depth 1. This field existing without being wired up was itself
    # the bug -- a reproducibility record that doesn't actually reproduce.
    scope_max_depth: int | None = None
    raw: dict = field(default_factory=dict, repr=False)

    @classmethod
    def from_dict(cls, data: dict) -> "SourceManifest":
        missing = [k for k in REQUIRED_TOP_LEVEL if k not in data]
        if missing:
            raise ManifestError(f"source-manifest missing required key(s): {', '.join(missing)}")
        compiler = data.get("compiler") or {}
        missing_compiler = [k for k in REQUIRED_COMPILER if k not in compiler]
        if missing_compiler:
            raise ManifestError(
                f"source-manifest.compiler missing required key(s): {', '.join(missing_compiler)}"
            )
        scope = data.get("scope") or {}
        roots = scope.get("roots") or []
        if not isinstance(roots, list):
            raise ManifestError("source-manifest.scope.roots must be a list")
        max_depth = scope.get("max_depth")
        if max_depth is not None and not isinstance(max_depth, int):
            raise ManifestError("source-manifest.scope.max_depth must be an integer when present")
        return cls(
            id=data["id"],
            source_url=data["source_url"],
            scope_roots=list(roots),
            compiler_prompt_version=compiler["prompt_version"],
            compiler_runs=int(compiler["runs"]),
            source_version=data.get("source_version"),
            source_sha256=data.get("source_sha256"),
            scope_max_depth=max_depth,
            raw=data,
        )

    def to_dict(self) -> dict:
        # Preserves any extra keys a hand-edited manifest already carried
        # (raw), then overlays the fields this dataclass actually owns, so a
        # round trip through load_manifest -> write_manifest doesn't silently
        # drop fields this module doesn't know about.
        out = dict(self.raw)
        scope_out = {**(self.raw.get("scope") or {}), "roots": self.scope_roots}
        if self.scope_max_depth is not None:
            scope_out["max_depth"] = self.scope_max_depth
        out.update(
            {
                "id": self.id,
                "source_url": self.source_url,
                "source_version": self.source_version,
                "source_sha256": self.source_sha256,
                "scope": scope_out,
                "compiler": {
                    **(self.raw.get("compiler") or {}),
                    "prompt_version": self.compiler_prompt_version,
                    "runs": self.compiler_runs,
                },
            }
        )
        return out


def load_manifest(path: str | Path) -> SourceManifest:
    path = Path(path)
    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    if not isinstance(data, dict):
        raise ManifestError(f"{path}: source-manifest.yaml must be a YAML mapping at the top level")
    return SourceManifest.from_dict(data)


def write_manifest(path: str | Path, manifest: SourceManifest) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(manifest.to_dict(), f, default_flow_style=False, sort_keys=False)
