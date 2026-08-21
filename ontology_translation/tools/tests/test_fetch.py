"""Tests for fetch.py's download-and-checksum-verify flow, including the
multi-file support added for issue #110 (some real ontologies, like FIBO,
are split across several owl:imports-linked files rather than published
as one self-contained document). Offline: every URL here is a local
file:// URL, no network access needed."""

import tempfile
import unittest
from pathlib import Path

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

from fetch import FetchError, download, fetch_for_manifest, source_filename


def _write_manifest(tmp_path: Path, body: str) -> Path:
    manifest_path = tmp_path / "source-manifest.yaml"
    manifest_path.write_text(body, encoding="utf-8")
    return manifest_path


class SourceFilenameTests(unittest.TestCase):
    def test_uses_the_urls_own_last_path_segment(self):
        self.assertEqual(source_filename("https://example.org/LOAN/Loans.rdf", 0), "Loans.rdf")

    def test_falls_back_to_a_positional_name_with_no_path_segment(self):
        self.assertEqual(source_filename("https://example.org/", 2), "source-2")


class DownloadTests(unittest.TestCase):
    def test_downloads_a_local_file_url_and_returns_its_sha256(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            src = tmp_path / "upstream.rdf"
            src.write_text("hello world", encoding="utf-8")
            dest = tmp_path / "downloaded.rdf"

            digest = download(src.as_uri(), dest)

            self.assertEqual(dest.read_text(encoding="utf-8"), "hello world")
            import hashlib

            self.assertEqual(digest, hashlib.sha256(b"hello world").hexdigest())


class FetchForManifestSingleFileTests(unittest.TestCase):
    """Unchanged single-file behavior -- --out is the exact file to write,
    same as before issue #110's multi-file support existed."""

    def test_writes_to_the_exact_out_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            src = tmp_path / "upstream.rdf"
            src.write_text("content-a", encoding="utf-8")
            manifest_path = _write_manifest(
                tmp_path,
                f"id: test-domain\nsource_url: {src.as_uri()}\nscope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
            )
            out_path = tmp_path / "source.rdf"

            digests = fetch_for_manifest(manifest_path, out_path)

            self.assertEqual(len(digests), 1)
            self.assertTrue(out_path.is_file())
            self.assertEqual(out_path.read_text(encoding="utf-8"), "content-a")

    def test_mismatched_pinned_checksum_raises(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            src = tmp_path / "upstream.rdf"
            src.write_text("content-a", encoding="utf-8")
            manifest_path = _write_manifest(
                tmp_path,
                f"id: test-domain\nsource_url: {src.as_uri()}\nsource_sha256: deadbeef\nscope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
            )
            with self.assertRaises(FetchError):
                fetch_for_manifest(manifest_path, tmp_path / "source.rdf")


class FetchForManifestMultiFileTests(unittest.TestCase):
    """Issue #110's general fix: a manifest with extra_source_urls treats
    --out as a directory, one file per source_urls entry."""

    def test_out_path_becomes_a_directory_with_one_file_per_url(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = tmp_path / "a.rdf"
            b = tmp_path / "b.rdf"
            a.write_text("content-a", encoding="utf-8")
            b.write_text("content-b", encoding="utf-8")
            manifest_path = _write_manifest(
                tmp_path,
                f"id: test-domain\nsource_url: {a.as_uri()}\n"
                f"extra_source_urls:\n  - {b.as_uri()}\nscope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
            )
            out_dir = tmp_path / "sources"

            digests = fetch_for_manifest(manifest_path, out_dir)

            self.assertEqual(len(digests), 2)
            self.assertEqual((out_dir / "a.rdf").read_text(encoding="utf-8"), "content-a")
            self.assertEqual((out_dir / "b.rdf").read_text(encoding="utf-8"), "content-b")

    def test_per_file_pinned_checksum_is_verified_independently(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = tmp_path / "a.rdf"
            b = tmp_path / "b.rdf"
            a.write_text("content-a", encoding="utf-8")
            b.write_text("content-b", encoding="utf-8")
            import hashlib

            good_hash_a = hashlib.sha256(b"content-a").hexdigest()
            manifest_path = _write_manifest(
                tmp_path,
                f"id: test-domain\nsource_url: {a.as_uri()}\nsource_sha256: {good_hash_a}\n"
                f"extra_source_urls:\n  - {b.as_uri()}\nextra_source_sha256:\n  - deadbeef\n"
                "scope:\n  roots: []\ncompiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
            )
            # a's pinned hash is correct, b's is deliberately wrong -- must
            # fail on b specifically, not silently pass because a matched.
            with self.assertRaises(FetchError):
                fetch_for_manifest(manifest_path, tmp_path / "sources")

    def test_unpinned_multi_file_manifest_downloads_without_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = tmp_path / "a.rdf"
            b = tmp_path / "b.rdf"
            a.write_text("content-a", encoding="utf-8")
            b.write_text("content-b", encoding="utf-8")
            manifest_path = _write_manifest(
                tmp_path,
                f"id: test-domain\nsource_url: {a.as_uri()}\n"
                f"extra_source_urls:\n  - {b.as_uri()}\nscope:\n  roots: []\n"
                "compiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
            )
            digests = fetch_for_manifest(manifest_path, tmp_path / "sources")
            self.assertEqual(len(digests), 2)


if __name__ == "__main__":
    unittest.main()
