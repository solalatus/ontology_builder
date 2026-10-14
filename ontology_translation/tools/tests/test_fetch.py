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

import hashlib
import io
from contextlib import redirect_stderr

import yaml

from fetch import FetchError, download, fetch_for_manifest, main as fetch_main, source_filename


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

            digests = fetch_for_manifest(manifest_path, out_path, redownload=True)

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
                fetch_for_manifest(manifest_path, tmp_path / "source.rdf", redownload=True)


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

            digests = fetch_for_manifest(manifest_path, out_dir, redownload=True)

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
                fetch_for_manifest(manifest_path, tmp_path / "sources", redownload=True)

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
            digests = fetch_for_manifest(manifest_path, tmp_path / "sources", redownload=True)
            self.assertEqual(len(digests), 2)


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _domain(tmp_path: Path, files: dict[str, str], pins: dict[str, str | None] | None = None, license: str | None = None) -> Path:
    """A domain folder: upstream/<name> holds the 'remote' files (file://
    URLs), and the manifest sits in domain/, where source/ will be the
    committed copies. `pins` maps a file name to its pinned sha256
    (default: the correct hash; None: unpinned)."""
    upstream = tmp_path / "upstream"
    upstream.mkdir(exist_ok=True)
    names = list(files)
    for name, text in files.items():
        (upstream / name).write_text(text, encoding="utf-8")
    pins = pins if pins is not None else {n: _sha(t) for n, t in files.items()}
    domain = tmp_path / "domain"
    domain.mkdir(exist_ok=True)
    body = f"id: test-domain\nsource_url: {(upstream / names[0]).as_uri()}\n"
    if pins.get(names[0]):
        body += f"source_sha256: {pins[names[0]]}\n"
    if license:
        body += f"source_license: {license}\n"
    if len(names) > 1:
        body += "extra_source_urls:\n" + "".join(f"  - {(upstream / n).as_uri()}\n" for n in names[1:])
        body += "extra_source_sha256:\n" + "".join(f"  - {pins.get(n) or 'null'}\n" for n in names[1:])
    body += "scope:\n  roots: []\ncompiler:\n  prompt_version: compiler-prompt\n  runs: 1\n"
    return _write_manifest(domain, body)


class RedownloadCommitsSourceAndProvenanceTests(unittest.TestCase):
    """--redownload: download, verify against the pins, then (and only then)
    replace the committed copies in source/ and rewrite PROVENANCE.yaml."""

    def test_writes_committed_copies_and_a_complete_provenance_record(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = _domain(tmp_path, {"a.rdf": "content-a", "b.rdf": "content-b"}, license="MIT (test)")

            digests = fetch_for_manifest(manifest, redownload=True)

            source = manifest.parent / "source"
            self.assertEqual(digests, [_sha("content-a"), _sha("content-b")])
            self.assertEqual((source / "a.rdf").read_text(encoding="utf-8"), "content-a")
            self.assertEqual((source / "b.rdf").read_text(encoding="utf-8"), "content-b")
            prov = yaml.safe_load((source / "PROVENANCE.yaml").read_text(encoding="utf-8"))
            self.assertEqual(prov["domain"], "test-domain")
            self.assertEqual(prov["license"], "MIT (test)")
            self.assertEqual([f["file"] for f in prov["files"]], ["a.rdf", "b.rdf"])
            for rec, text in zip(prov["files"], ["content-a", "content-b"]):
                self.assertEqual(rec["sha256"], _sha(text))
                self.assertEqual(rec["bytes"], len(text))
                self.assertTrue(rec["url"].startswith("file://") and rec["url"].endswith(rec["file"]))
                self.assertRegex(rec["downloaded_at"], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
                self.assertIs(rec["matches_manifest_pin"], True)
            self.assertEqual(list(source.glob(".*.part")), [], "no partial files left behind")

    def test_unpinned_file_is_recorded_as_not_pinned(self):
        with tempfile.TemporaryDirectory() as tmp:
            manifest = _domain(Path(tmp), {"a.rdf": "content-a"}, pins={"a.rdf": None})
            fetch_for_manifest(manifest, redownload=True)
            prov = yaml.safe_load((manifest.parent / "source" / "PROVENANCE.yaml").read_text(encoding="utf-8"))
            self.assertEqual(prov["files"][0]["matches_manifest_pin"], "not pinned")

    def test_a_mismatching_download_leaves_the_committed_copies_untouched(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            # a is unpinned, so its new bytes would pass on their own.
            manifest = _domain(tmp_path, {"a.rdf": "content-a", "b.rdf": "content-b"},
                               pins={"a.rdf": None, "b.rdf": _sha("content-b")})
            fetch_for_manifest(manifest, redownload=True)
            source = manifest.parent / "source"
            provenance_before = (source / "PROVENANCE.yaml").read_text(encoding="utf-8")
            # Upstream changes BOTH files; b's pin no longer matches. Neither
            # committed copy may be replaced -- not even a -- because the set
            # must stay consistent.
            (tmp_path / "upstream" / "a.rdf").write_text("new-a", encoding="utf-8")
            (tmp_path / "upstream" / "b.rdf").write_text("tampered", encoding="utf-8")

            with self.assertRaises(FetchError):
                fetch_for_manifest(manifest, redownload=True)

            self.assertEqual((source / "a.rdf").read_text(encoding="utf-8"), "content-a")
            self.assertEqual((source / "b.rdf").read_text(encoding="utf-8"), "content-b")
            self.assertEqual((source / "PROVENANCE.yaml").read_text(encoding="utf-8"), provenance_before)
            self.assertEqual(list(source.glob(".*.part")), [], "no partial files left behind")

    def test_also_copies_to_out_when_given(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = _domain(tmp_path, {"a.rdf": "content-a"})
            fetch_for_manifest(manifest, tmp_path / "work" / "source.rdf", redownload=True)
            self.assertEqual((tmp_path / "work" / "source.rdf").read_text(encoding="utf-8"), "content-a")


class LoadCommittedSourceTests(unittest.TestCase):
    """The default: load the committed copies, verify them against the pins,
    never touch the network. Each test deletes the upstream files after the
    initial --redownload, so any attempt to download would fail."""

    def _committed(self, tmp_path: Path, files: dict[str, str]) -> Path:
        manifest = _domain(tmp_path, files)
        fetch_for_manifest(manifest, redownload=True)
        for p in (tmp_path / "upstream").iterdir():
            p.unlink()
        return manifest

    def test_single_file_loads_and_copies_to_the_exact_out_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = self._committed(tmp_path, {"a.rdf": "content-a"})
            out = tmp_path / "work" / "source.rdf"

            digests = fetch_for_manifest(manifest, out)

            self.assertEqual(digests, [_sha("content-a")])
            self.assertEqual(out.read_text(encoding="utf-8"), "content-a")

    def test_multi_file_loads_into_an_out_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = self._committed(tmp_path, {"a.rdf": "content-a", "b.rdf": "content-b"})
            out = tmp_path / "work" / "sources"

            fetch_for_manifest(manifest, out)

            self.assertEqual(sorted(p.name for p in out.iterdir()), ["a.rdf", "b.rdf"])
            self.assertEqual((out / "b.rdf").read_text(encoding="utf-8"), "content-b")

    def test_without_out_it_only_verifies(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = self._committed(tmp_path, {"a.rdf": "content-a"})
            self.assertEqual(fetch_for_manifest(manifest), [_sha("content-a")])

    def test_a_modified_committed_copy_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = self._committed(tmp_path, {"a.rdf": "content-a"})
            (manifest.parent / "source" / "a.rdf").write_text("edited by hand", encoding="utf-8")
            with self.assertRaisesRegex(FetchError, "does not match the manifest's pinned checksum"):
                fetch_for_manifest(manifest, tmp_path / "out.rdf")
            self.assertFalse((tmp_path / "out.rdf").exists())

    def test_a_missing_committed_copy_says_to_redownload(self):
        with tempfile.TemporaryDirectory() as tmp:
            manifest = _domain(Path(tmp), {"a.rdf": "content-a"})
            with self.assertRaisesRegex(FetchError, "--redownload"):
                fetch_for_manifest(manifest)


class CliTests(unittest.TestCase):
    def test_manifest_mode_defaults_to_load_and_out_is_optional(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest = _domain(tmp_path, {"a.rdf": "content-a"})
            self.assertEqual(fetch_main(["--manifest", str(manifest)]), 1, "nothing committed yet")
            self.assertEqual(fetch_main(["--manifest", str(manifest), "--redownload"]), 0)
            self.assertEqual(fetch_main(["--manifest", str(manifest)]), 0)

    def test_url_mode_still_requires_out(self):
        with redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
            fetch_main(["--url", "file:///nowhere.rdf"])


if __name__ == "__main__":
    unittest.main()
