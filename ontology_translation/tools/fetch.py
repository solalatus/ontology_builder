"""Download a source ontology and checksum-verify it (issue #102's
reproducibility requirement: every translated domain records source URL and
SHA-256 of the exact bytes that were compiled).

Two modes:

- `--manifest source-manifest.yaml` -- downloads `source_url` from the
  manifest. If the manifest already pins `source_sha256`, the download must
  match it exactly or the fetch fails loudly (a changed upstream file is a
  reproducibility break, not something to silently accept). If the manifest
  has no pin yet (first fetch for a new domain), the computed hash is
  printed so it can be copied into the manifest -- pinning is a deliberate
  human/reviewed step, this tool never writes a hash back on its own.

- `--url <url> --out <path>` -- ad hoc fetch outside the manifest flow, for
  exploring a candidate source before committing it to a domain.

Uses only the standard library (urllib), so it picks up the environment's
HTTPS_PROXY/HTTP_PROXY automatically via urllib's default ProxyHandler --
no extra dependency, and no proxy-specific code needed here.
"""

from __future__ import annotations

import argparse
import hashlib
import sys
import urllib.request
from pathlib import Path

from source_manifest import load_manifest

CHUNK_SIZE = 1 << 16
DEFAULT_TIMEOUT = 60


class FetchError(RuntimeError):
    pass


def download(url: str, out_path: Path, timeout: int = DEFAULT_TIMEOUT) -> str:
    """Downloads url to out_path, returns the SHA-256 hex digest of the bytes
    actually written. Streams to disk so large sources don't sit in memory."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    req = urllib.request.Request(url, headers={"User-Agent": "ontology_builder-fetch/1"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp, out_path.open("wb") as f:
            while True:
                chunk = resp.read(CHUNK_SIZE)
                if not chunk:
                    break
                digest.update(chunk)
                f.write(chunk)
    except Exception as exc:  # noqa: BLE001 -- surfaced as FetchError, not swallowed
        raise FetchError(f"failed to fetch {url}: {exc}") from exc
    return digest.hexdigest()


def fetch_for_manifest(manifest_path: Path, out_path: Path) -> str:
    manifest = load_manifest(manifest_path)
    print(f"[fetch] {manifest.id}: downloading {manifest.source_url}")
    actual_sha256 = download(manifest.source_url, out_path)
    print(f"[fetch] {manifest.id}: sha256={actual_sha256} -> {out_path}")
    if manifest.source_sha256:
        if actual_sha256 != manifest.source_sha256:
            raise FetchError(
                f"{manifest.id}: checksum mismatch -- manifest pins "
                f"{manifest.source_sha256}, downloaded file hashes to {actual_sha256}. "
                "The upstream source changed since this domain was pinned; do not "
                "proceed without a deliberate, reviewed re-pin of source-manifest.yaml."
            )
        print(f"[fetch] {manifest.id}: checksum verified against pinned manifest value")
    else:
        print(
            f"[fetch] {manifest.id}: no source_sha256 pinned yet in the manifest -- "
            f"add `source_sha256: {actual_sha256}` after reviewing this download"
        )
    return actual_sha256


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--manifest", type=Path, help="source-manifest.yaml to fetch for")
    group.add_argument("--url", type=str, help="ad hoc URL, outside the manifest flow")
    parser.add_argument("--out", type=Path, required=True, help="path to write the downloaded file")
    args = parser.parse_args(argv)

    try:
        if args.manifest:
            fetch_for_manifest(args.manifest, args.out)
        else:
            sha256 = download(args.url, args.out)
            print(f"[fetch] sha256={sha256} -> {args.out}")
    except FetchError as exc:
        print(f"[fetch] ERROR: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
