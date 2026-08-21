"""Download a source ontology and checksum-verify it (issue #102's
reproducibility requirement: every translated domain records source URL and
SHA-256 of the exact bytes that were compiled).

Two modes:

- `--manifest source-manifest.yaml` -- downloads every file in
  `manifest.source_urls` (the primary `source_url`, plus any
  `extra_source_urls` -- see source_manifest.py for why a domain can have
  more than one). For a single-file manifest (the common case), `--out` is
  the exact file path to write, unchanged from before this existed. For a
  multi-file manifest, `--out` is a DIRECTORY: each source is written
  there under its own URL's filename. Either way, any already-pinned
  `source_sha256`/`extra_source_sha256` entry must match its download
  exactly or the fetch fails loudly (a changed upstream file is a
  reproducibility break, not something to silently accept); an unpinned
  entry has its computed hash printed for review instead -- pinning is a
  deliberate human step, this tool never writes a hash back on its own.

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
from urllib.parse import urlsplit

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


def source_filename(url: str, index: int) -> str:
    """Filename a multi-file fetch writes one source under -- the URL's own
    last path segment, so re-running fetch (or run_pipeline.py resuming
    from an existing directory) lands on the same name deterministically.
    Falls back to a positional name for a URL with no path segment at all
    (rare, but not impossible for a query-string-only endpoint)."""
    name = Path(urlsplit(url).path).name
    return name or f"source-{index}"


def _verify_or_report(domain_id: str, label: str, actual_sha256: str, pinned_sha256: str | None) -> None:
    if pinned_sha256:
        if actual_sha256 != pinned_sha256:
            raise FetchError(
                f"{domain_id}: checksum mismatch for {label} -- manifest pins "
                f"{pinned_sha256}, downloaded file hashes to {actual_sha256}. "
                "The upstream source changed since this domain was pinned; do not "
                "proceed without a deliberate, reviewed re-pin of source-manifest.yaml."
            )
        print(f"[fetch] {domain_id}: {label} checksum verified against pinned manifest value")
    else:
        print(
            f"[fetch] {domain_id}: no checksum pinned yet for {label} -- "
            f"add `{actual_sha256}` to the manifest after reviewing this download"
        )


def fetch_for_manifest(manifest_path: Path, out_path: Path) -> list[str]:
    """Downloads every file in the manifest's `source_urls` (see
    source_manifest.py). Returns the actual sha256 of each, in the same
    order. For the common single-file case, `out_path` is the exact file
    to write (unchanged behavior); for a multi-file manifest, `out_path`
    is treated as a directory and each source is written under its own
    `source_filename()`."""
    manifest = load_manifest(manifest_path)
    urls = manifest.source_urls
    pinned = manifest.source_sha256s

    if len(urls) == 1:
        print(f"[fetch] {manifest.id}: downloading {urls[0]}")
        actual_sha256 = download(urls[0], out_path)
        print(f"[fetch] {manifest.id}: sha256={actual_sha256} -> {out_path}")
        _verify_or_report(manifest.id, "source", actual_sha256, pinned[0])
        return [actual_sha256]

    out_path.mkdir(parents=True, exist_ok=True)
    digests = []
    for i, url in enumerate(urls):
        dest = out_path / source_filename(url, i)
        print(f"[fetch] {manifest.id}: downloading {url}")
        actual_sha256 = download(url, dest)
        print(f"[fetch] {manifest.id}: sha256={actual_sha256} -> {dest}")
        _verify_or_report(manifest.id, dest.name, actual_sha256, pinned[i] if i < len(pinned) else None)
        digests.append(actual_sha256)
    return digests


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
