"""Tests for source_manifest.py -- offline, no dependencies beyond PyYAML."""

import tempfile
import unittest
from pathlib import Path

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

from source_manifest import ManifestError, load_manifest, write_manifest

VALID_MANIFEST_YAML = """
id: iof-maintenance
source_url: https://example.org/Maintenance.rdf
source_version: Release_202602
source_sha256: abc123
scope:
  roots:
    - MaintenanceActivity
    - FailureMode
compiler:
  prompt_version: compiler-v1
  runs: 3
"""


class LoadManifestTests(unittest.TestCase):
    def _write(self, text: str) -> Path:
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False, encoding="utf-8")
        tmp.write(text)
        tmp.close()
        return Path(tmp.name)

    def test_loads_valid_manifest(self):
        path = self._write(VALID_MANIFEST_YAML)
        manifest = load_manifest(path)
        self.assertEqual(manifest.id, "iof-maintenance")
        self.assertEqual(manifest.source_sha256, "abc123")
        self.assertEqual(manifest.scope_roots, ["MaintenanceActivity", "FailureMode"])
        self.assertEqual(manifest.compiler_prompt_version, "compiler-v1")
        self.assertEqual(manifest.compiler_runs, 3)

    def test_missing_source_sha256_is_allowed_pre_pin(self):
        text = VALID_MANIFEST_YAML.replace("source_sha256: abc123\n", "")
        manifest = load_manifest(self._write(text))
        self.assertIsNone(manifest.source_sha256)

    def test_missing_required_top_level_key_raises(self):
        text = VALID_MANIFEST_YAML.replace("source_url: https://example.org/Maintenance.rdf\n", "")
        with self.assertRaises(ManifestError):
            load_manifest(self._write(text))

    def test_missing_compiler_runs_raises(self):
        text = VALID_MANIFEST_YAML.replace("  runs: 3\n", "")
        with self.assertRaises(ManifestError):
            load_manifest(self._write(text))

    def test_scope_roots_must_be_list(self):
        text = VALID_MANIFEST_YAML.replace(
            "scope:\n  roots:\n    - MaintenanceActivity\n    - FailureMode\n",
            "scope:\n  roots: MaintenanceActivity\n",
        )
        with self.assertRaises(ManifestError):
            load_manifest(self._write(text))

    def test_round_trip_preserves_fields(self):
        original_path = self._write(VALID_MANIFEST_YAML)
        manifest = load_manifest(original_path)
        manifest.source_sha256 = "deadbeef"

        with tempfile.TemporaryDirectory() as tmp:
            out_path = Path(tmp) / "source-manifest.yaml"
            write_manifest(out_path, manifest)
            reloaded = load_manifest(out_path)

        self.assertEqual(reloaded.id, "iof-maintenance")
        self.assertEqual(reloaded.source_sha256, "deadbeef")
        self.assertEqual(reloaded.scope_roots, ["MaintenanceActivity", "FailureMode"])
        self.assertEqual(reloaded.compiler_runs, 3)


if __name__ == "__main__":
    unittest.main()
