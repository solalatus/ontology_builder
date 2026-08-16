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
      prompt_version: compiler-v1
      runs: 3

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
        return cls(
            id=data["id"],
            source_url=data["source_url"],
            scope_roots=list(roots),
            compiler_prompt_version=compiler["prompt_version"],
            compiler_runs=int(compiler["runs"]),
            source_version=data.get("source_version"),
            source_sha256=data.get("source_sha256"),
            raw=data,
        )

    def to_dict(self) -> dict:
        # Preserves any extra keys a hand-edited manifest already carried
        # (raw), then overlays the fields this dataclass actually owns, so a
        # round trip through load_manifest -> write_manifest doesn't silently
        # drop fields this module doesn't know about.
        out = dict(self.raw)
        out.update(
            {
                "id": self.id,
                "source_url": self.source_url,
                "source_version": self.source_version,
                "source_sha256": self.source_sha256,
                "scope": {**(self.raw.get("scope") or {}), "roots": self.scope_roots},
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
