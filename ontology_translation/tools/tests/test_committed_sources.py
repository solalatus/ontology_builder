"""The committed original sources under ontology_translation/domains/<id>/source/
(issue #155 follow-up): every domain has them, they are byte-identical to
what each source-manifest.yaml pins, and PROVENANCE.yaml agrees with both.
Offline: reads only files in the repository."""

import hashlib
import re
import unittest
from pathlib import Path

import sys as _sys

_sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import yaml

from fetch import PROVENANCE_FILENAME, committed_source_dir, fetch_for_manifest, source_filename
from source_manifest import load_manifest

DOMAINS_DIR = Path(__file__).resolve().parents[2] / "domains"
REPO_ROOT = Path(__file__).resolve().parents[3]
MANIFESTS = sorted(DOMAINS_DIR.glob("*/source-manifest.yaml"))


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class EveryDomainHasItsOriginalSourceTests(unittest.TestCase):
    def test_there_are_manifests_to_check(self):
        self.assertEqual(
            sorted(m.parent.name for m in MANIFESTS),
            ["brick-hvac", "fibo-loans", "iof-maintenance", "iof-supply-chain"],
        )

    def test_every_domain_folder_has_a_source_folder_with_provenance(self):
        for domain in sorted(p.parent for p in DOMAINS_DIR.glob("*/reference.domain.yaml")):
            with self.subTest(domain=domain.name):
                self.assertTrue((domain / "source" / PROVENANCE_FILENAME).is_file())


class ManifestDomainSourcesTests(unittest.TestCase):
    def test_committed_copies_load_and_match_the_pinned_checksums(self):
        for manifest_path in MANIFESTS:
            with self.subTest(domain=manifest_path.parent.name):
                manifest = load_manifest(manifest_path)
                self.assertTrue(all(manifest.source_sha256s), "every source file is pinned")
                # The real default code path: loads, verifies, raises on any mismatch.
                self.assertEqual(fetch_for_manifest(manifest_path), manifest.source_sha256s)

    def test_provenance_agrees_with_the_manifest_and_the_files(self):
        for manifest_path in MANIFESTS:
            with self.subTest(domain=manifest_path.parent.name):
                manifest = load_manifest(manifest_path)
                source_dir = committed_source_dir(manifest_path)
                prov = yaml.safe_load((source_dir / PROVENANCE_FILENAME).read_text(encoding="utf-8"))
                self.assertEqual(prov["domain"], manifest.id)
                self.assertEqual(prov["source_version"], manifest.source_version)
                self.assertTrue(manifest.raw.get("source_license"), "the manifest records a licence")
                self.assertEqual(prov["license"], manifest.raw["source_license"])
                self.assertEqual(len(prov["files"]), len(manifest.source_urls))
                for i, (rec, url, pin) in enumerate(zip(prov["files"], manifest.source_urls, manifest.source_sha256s)):
                    path = source_dir / rec["file"]
                    self.assertEqual(rec["file"], source_filename(url, i))
                    self.assertEqual(rec["url"], url)
                    self.assertEqual(rec["sha256"], pin)
                    self.assertEqual(rec["sha256"], _sha(path))
                    self.assertEqual(rec["bytes"], path.stat().st_size)
                    self.assertRegex(str(rec["downloaded_at"]), r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
                    self.assertIs(rec["matches_manifest_pin"], True)

    def test_source_folders_hold_nothing_unaccounted_for(self):
        for manifest_path in MANIFESTS:
            with self.subTest(domain=manifest_path.parent.name):
                source_dir = committed_source_dir(manifest_path)
                prov = yaml.safe_load((source_dir / PROVENANCE_FILENAME).read_text(encoding="utf-8"))
                expected = {r["file"] for r in prov["files"]} | {PROVENANCE_FILENAME}
                if "source/LICENSE" in str(prov.get("license")):
                    expected.add("LICENSE")
                self.assertEqual({p.name for p in source_dir.iterdir()}, expected)

    def test_brick_ships_its_bsd_licence_text(self):
        text = (DOMAINS_DIR / "brick-hvac" / "source" / "LICENSE").read_text(encoding="utf-8")
        self.assertIn("Brick Consortium", text)
        self.assertIn("Redistribution and use in source and binary forms", text)


class ItopsOriginalFixtureTests(unittest.TestCase):
    """itops has no upstream: its original is the MTSR fixture as first
    committed, before its "is a" predicates were removed (d197883)."""

    def setUp(self):
        self.source_dir = DOMAINS_DIR / "itops" / "source"
        self.prov = yaml.safe_load((self.source_dir / PROVENANCE_FILENAME).read_text(encoding="utf-8"))
        self.original = yaml.safe_load((self.source_dir / "itops_mtsr.original.yaml").read_text(encoding="utf-8"))
        self.current = yaml.safe_load(
            (REPO_ROOT / "tests" / "evals" / "fixtures" / "itops_mtsr.yaml").read_text(encoding="utf-8")
        )

    def test_provenance_matches_the_file(self):
        [rec] = self.prov["files"]
        path = self.source_dir / rec["file"]
        self.assertEqual(rec["sha256"], _sha(path))
        self.assertEqual(rec["bytes"], path.stat().st_size)
        self.assertRegex(rec["first_committed_in"], r"^[0-9a-f]{40}$")

    def test_it_still_has_the_23_is_a_predicates_the_cleaned_fixture_dropped(self):
        def is_a(fixture):
            preds = fixture["predicates"]
            preds = preds.values() if isinstance(preds, dict) else preds
            return [p for p in preds if p.get("label") == "is a"]

        self.assertEqual(len(is_a(self.original)), 23)
        self.assertEqual(is_a(self.current), [])

    def test_the_cleaning_left_classes_and_value_sets_untouched(self):
        # d197883's own claim: only predicates/actions were edited.
        self.assertEqual(self.original["classes"], self.current["classes"])
        self.assertEqual(self.original.get("valueSets"), self.current.get("valueSets"))


if __name__ == "__main__":
    unittest.main()
