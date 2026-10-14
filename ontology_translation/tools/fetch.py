"""Download a source ontology and checksum-verify it (issue #102's
reproducibility requirement: every translated domain records source URL and
SHA-256 of the exact bytes that were compiled).

Committed sources (issue #155 follow-up): the original source files of
every domain are committed under `domains/<id>/source/`, named by
`source_filename()`, with a `PROVENANCE.yaml` beside them recording each
file's URL, SHA-256, size, licence and when it was downloaded. In manifest
mode fetch.py therefore LOADS by default: it verifies each committed copy
against the manifest's pinned checksum and copies it to `--out`, without
touching the network. `--redownload` fetches from the pinned URLs instead,
verifies them the same way, and only then replaces the committed copies and
rewrites `PROVENANCE.yaml` (a mismatching download leaves the committed
copy untouched). A domain with no committed copy yet must be fetched once
with `--redownload`.

Two modes:

- `--manifest source-manifest.yaml` -- loads (or with `--redownload`,
  downloads) every file in
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
import shutil
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

import yaml

from source_manifest import load_manifest

COMMITTED_SOURCE_DIRNAME = "source"
PROVENANCE_FILENAME = "PROVENANCE.yaml"

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


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(CHUNK_SIZE), b""):
            digest.update(chunk)
    return digest.hexdigest()


def committed_source_dir(manifest_path: Path) -> Path:
    """Where a domain's original source files are committed: next to its
    manifest, in `source/`."""
    return manifest_path.parent / COMMITTED_SOURCE_DIRNAME


def _write_provenance(manifest, source_dir: Path, records: list[dict]) -> None:
    provenance = {
        "domain": manifest.id,
        "written_by": "ontology_translation/tools/fetch.py --redownload",
        "source_version": manifest.source_version,
        "license": manifest.raw.get("source_license"),
        "files": records,
    }
    header = (
        "# Provenance of the committed original source files in this folder.\n"
        "# Written by fetch.py --redownload; do not edit by hand.\n"
    )
    (source_dir / PROVENANCE_FILENAME).write_text(
        header + yaml.safe_dump(provenance, sort_keys=False, allow_unicode=True), encoding="utf-8"
    )


def _redownload(manifest, source_dir: Path) -> list[str]:
    urls, pinned = manifest.source_urls, manifest.source_sha256s
    source_dir.mkdir(parents=True, exist_ok=True)
    staged = []
    try:
        for i, url in enumerate(urls):
            name = source_filename(url, i)
            part = source_dir / f".{name}.part"
            print(f"[fetch] {manifest.id}: downloading {url}")
            actual = download(url, part)
            downloaded_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
            staged.append((part, source_dir / name, url, actual, downloaded_at, pinned[i] if i < len(pinned) else None))
            _verify_or_report(manifest.id, name, actual, staged[-1][5])
    except FetchError:
        for part, *_ in staged:
            part.unlink(missing_ok=True)
        for leftover in source_dir.glob(".*.part"):
            leftover.unlink(missing_ok=True)
        raise
    records = []
    for part, final, url, actual, downloaded_at, pin in staged:
        part.replace(final)
        records.append({
            "file": final.name,
            "url": url,
            "sha256": actual,
            "bytes": final.stat().st_size,
            "downloaded_at": downloaded_at,
            "matches_manifest_pin": True if pin else "not pinned",
        })
        print(f"[fetch] {manifest.id}: committed copy updated -> {final}")
    _write_provenance(manifest, source_dir, records)
    return [r["sha256"] for r in records]


def _load_committed(manifest, source_dir: Path) -> list[str]:
    urls, pinned = manifest.source_urls, manifest.source_sha256s
    digests = []
    for i, url in enumerate(urls):
        path = source_dir / source_filename(url, i)
        if not path.is_file():
            raise FetchError(
                f"{manifest.id}: no committed copy of {url} at {path} -- "
                "run fetch.py with --redownload once to download and commit it"
            )
        actual = sha256_of(path)
        pin = pinned[i] if i < len(pinned) else None
        if pin and actual != pin:
            raise FetchError(
                f"{manifest.id}: committed copy {path} does not match the manifest's pinned checksum "
                f"(pinned {pin}, file {actual}) -- it was modified; restore it from git or use --redownload"
            )
        print(f"[fetch] {manifest.id}: loaded committed copy {path} ({'checksum verified' if pin else 'not pinned: ' + actual})")
        digests.append(actual)
    return digests


def fetch_for_manifest(manifest_path: Path, out_path: Path | None = None, redownload: bool = False) -> list[str]:
    """Makes every file in the manifest's `source_urls` (see
    source_manifest.py) available and checksum-verified. By default it
    loads the committed copies from `source/` next to the manifest; with
    `redownload=True` it downloads them from their URLs first and refreshes
    those committed copies and PROVENANCE.yaml. Returns the sha256 of each
    file, in `source_urls` order.

    When `out_path` is given the files are also copied there: for the
    common single-file case `out_path` is the exact file to write; for a
    multi-file manifest it is a directory and each source lands under its
    own `source_filename()`."""
    manifest = load_manifest(manifest_path)
    source_dir = committed_source_dir(manifest_path)
    digests = _redownload(manifest, source_dir) if redownload else _load_committed(manifest, source_dir)

    if out_path is not None:
        names = [source_filename(u, i) for i, u in enumerate(manifest.source_urls)]
        if len(names) == 1:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            if out_path.resolve() != (source_dir / names[0]).resolve():
                shutil.copyfile(source_dir / names[0], out_path)
        else:
            out_path.mkdir(parents=True, exist_ok=True)
            for name in names:
                if (out_path / name).resolve() != (source_dir / name).resolve():
                    shutil.copyfile(source_dir / name, out_path / name)
        print(f"[fetch] {manifest.id}: -> {out_path}")
    return digests


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--manifest", type=Path, help="source-manifest.yaml to fetch for")
    group.add_argument("--url", type=str, help="ad hoc URL, outside the manifest flow")
    parser.add_argument(
        "--out", type=Path, default=None,
        help="where to put the file(s); required with --url. With --manifest it is optional: "
        "omit it to only verify (or, with --redownload, refresh) the committed copies",
    )
    parser.add_argument(
        "--redownload", action="store_true",
        help="with --manifest: download from the pinned URLs instead of loading the committed copies, "
        "and refresh those copies and PROVENANCE.yaml once every checksum matches",
    )
    args = parser.parse_args(argv)
    if args.url and args.out is None:
        parser.error("--url requires --out")

    try:
        if args.manifest:
            fetch_for_manifest(args.manifest, args.out, redownload=args.redownload)
        else:
            sha256 = download(args.url, args.out)
            print(f"[fetch] sha256={sha256} -> {args.out}")
    except FetchError as exc:
        print(f"[fetch] ERROR: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
