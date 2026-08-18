"""Tests for run_pipeline.py. Batch-builder tests are pure/deterministic
(no mocking needed). The end-to-end test exercises fetch-skip -> extract ->
compile --dry-run with a local fixture file and stops before any Azure
call, matching test_compile.py's "the real pipeline is only ever invoked
explicitly" convention -- no network, no credentials, no cost."""

import json
import tempfile
import unittest
from pathlib import Path

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

import run_pipeline as pipeline_mod

DOMAIN_DATA = {
    "classes": {
        "Fan": {"meaning": "A device that moves air.", "properties": {"status": {"type": "text", "allowed": ["on", "off"]}}},
        "Zone": {"meaning": "A controlled area of a building."},
    },
    "relationships": [{"name": "serves", "from": "Fan", "to": "Zone", "meaning": "The fan supplies air to the zone.", "aliases": []}],
    "rules": {},
    "actions": {},
    "competency_questions": [],
}

TRANSLATION = {
    "mappings": [
        {"target_path": "classes.Fan", "source_iris": ["http://ex.org#Fan"], "source_evidence": "e", "confidence": "high", "rationale": "r"},
        {"target_path": "classes.Fan.properties.status", "source_iris": ["http://ex.org#status"], "source_evidence": "e", "confidence": "high", "rationale": "r"},
        {"target_path": "classes.Zone", "source_iris": ["http://ex.org#Zone"], "source_evidence": "e", "confidence": "high", "rationale": "r"},
        {"target_path": "relationships[0]", "source_iris": ["http://ex.org#serves", "http://ex.org#Fan", "http://ex.org#Zone"], "source_evidence": "e", "confidence": "high", "rationale": "r"},
    ],
    "dispositions": [
        {"source_iri": "http://ex.org#Fan", "disposition": "mapped", "note": "classes.Fan"},
        {"source_iri": "http://ex.org#status", "disposition": "mapped", "note": "classes.Fan.properties.status"},
        {"source_iri": "http://ex.org#Zone", "disposition": "mapped", "note": "classes.Zone"},
        {"source_iri": "http://ex.org#serves", "disposition": "mapped", "note": "relationships[0]"},
        {"source_iri": "http://ex.org#Irrelevant", "disposition": "not_agent_relevant", "note": "identifier bookkeeping only, generic template"},
    ],
}

SOURCE_IR = {
    "classes": [
        {"iri": "http://ex.org#Fan", "kind": "class", "labels": ["Fan"], "definitions": ["A device that moves air."]},
        {"iri": "http://ex.org#Zone", "kind": "class", "labels": ["Zone"], "definitions": ["A controlled area."], "parents": ["http://ex.org#Equipment"]},
        {"iri": "http://ex.org#Irrelevant", "kind": "class", "labels": ["Irrelevant"], "definitions": ["Some identifier field."], "parents": ["http://ex.org#Equipment"]},
    ],
    "object_properties": [{"iri": "http://ex.org#serves", "kind": "object_property", "labels": ["serves"]}],
    "datatype_properties": [{"iri": "http://ex.org#status", "kind": "datatype_property", "labels": ["status"]}],
    "enumerations": [],
    "restrictions": [],
    "imports": [],
}


class BuildRepairBatchTests(unittest.TestCase):
    def test_no_unsupported_items_returns_empty(self):
        semantic_judging = {"unsupported_count": 0, "unsupported_paths": [], "results": []}
        rejected, context = pipeline_mod._build_repair_batch(DOMAIN_DATA, TRANSLATION, SOURCE_IR, semantic_judging)
        self.assertEqual(rejected, [])
        self.assertEqual(context, {})

    def test_unsupported_relationship_gets_current_shape_and_source_context(self):
        semantic_judging = {
            "unsupported_count": 1,
            "unsupported_paths": ["relationships[0]"],
            "results": [
                {
                    "target_path": "relationships[0]",
                    "raw_judgments": [
                        {"verdict": "unsupported", "rationale": "No real basis for this pairing."},
                        {"verdict": "unsupported", "rationale": "No real basis for this pairing."},
                        {"verdict": "supported", "rationale": "looks fine"},
                    ],
                    "majority_verdict": "unsupported",
                }
            ],
        }
        rejected, context = pipeline_mod._build_repair_batch(DOMAIN_DATA, TRANSLATION, SOURCE_IR, semantic_judging)
        self.assertEqual(len(rejected), 1)
        self.assertEqual(rejected[0]["target_path"], "relationships[0]")
        self.assertEqual(rejected[0]["current_shape"], DOMAIN_DATA["relationships"][0])
        self.assertEqual(rejected[0]["rejection_rationale"], "No real basis for this pairing.")
        # Both structurally-involved classes' real source definitions must
        # be present, resolved via the same helpers evaluate.py's own
        # judges use -- not reinvented matching logic.
        self.assertIn("Fan", context)
        self.assertIn("Zone", context)

    def test_unresolvable_target_path_is_skipped_not_crashed(self):
        semantic_judging = {
            "unsupported_count": 1,
            "unsupported_paths": ["classes.NoLongerThere.properties.gone"],
            "results": [],
        }
        rejected, context = pipeline_mod._build_repair_batch(DOMAIN_DATA, TRANSLATION, SOURCE_IR, semantic_judging)
        self.assertEqual(rejected, [])


class BuildReinstateBatchTests(unittest.TestCase):
    def test_no_unjustified_iris_returns_empty(self):
        disposition_judging = {"unjustified_count": 0, "unjustified_iris": [], "results": []}
        flagged = pipeline_mod._build_reinstate_batch(TRANSLATION, SOURCE_IR, disposition_judging)
        self.assertEqual(flagged, [])

    def test_unjustified_exclusion_gets_real_definition_and_siblings(self):
        disposition_judging = {
            "unjustified_count": 1,
            "unjustified_iris": ["http://ex.org#Irrelevant"],
            "results": [
                {
                    "source_iri": "http://ex.org#Irrelevant",
                    "raw_judgments": [
                        {"verdict": "unjustified", "rationale": "Comparable to kept siblings, no principled distinction."},
                        {"verdict": "unjustified", "rationale": "Comparable to kept siblings, no principled distinction."},
                        {"verdict": "partially_justified", "rationale": "borderline"},
                    ],
                    "majority_verdict": "unjustified",
                }
            ],
        }
        flagged = pipeline_mod._build_reinstate_batch(TRANSLATION, SOURCE_IR, disposition_judging)
        self.assertEqual(len(flagged), 1)
        item = flagged[0]
        self.assertEqual(item["source_iri"], "http://ex.org#Irrelevant")
        self.assertEqual(item["disposition"], "not_agent_relevant")
        self.assertEqual(item["source_definition"]["definitions"], ["Some identifier field."])
        self.assertEqual(item["judge_rationale"], "Comparable to kept siblings, no principled distinction.")
        # Zone shares Irrelevant's parent and is mapped -- a real sibling.
        sibling_iris = {s["iri"] for s in item["included_siblings"]}
        self.assertIn("http://ex.org#Zone", sibling_iris)

    def test_iri_with_no_disposition_entry_is_skipped(self):
        disposition_judging = {"unjustified_count": 1, "unjustified_iris": ["http://ex.org#NeverDispositioned"], "results": []}
        flagged = pipeline_mod._build_reinstate_batch(TRANSLATION, SOURCE_IR, disposition_judging)
        self.assertEqual(flagged, [])


TURTLE_FIXTURE = """
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix ex: <http://example.org/onto#> .

ex:Fan a owl:Class ;
    rdfs:label "Fan" ;
    rdfs:comment "A device that moves air." .
"""

MANIFEST_YAML = """id: test-domain
source_url: https://example.org/x.ttl
scope:
  roots: []
compiler:
  prompt_version: compiler-v1
  runs: 1
"""


class FixRoundStabilityRunsTests(unittest.TestCase):
    """compile.py writes one run-N.domain.yaml per manifest.compiler.runs,
    but only run-1 ever goes through the fix loop. Found for real: the loop
    never passed the other runs to evaluate.py's --stability-runs, so every
    domain that went through run_pipeline.py (as opposed to a hand-assembled
    evaluate.py invocation) silently got no translation_stability signal at
    all in its official report. Domain-agnostic by construction -- these
    tests only check that the sibling run paths, when given, reach
    evaluate.py's argv; they say nothing about what any particular domain's
    content should be."""

    def test_stability_run_paths_are_forwarded_to_evaluate(self):
        captured_argv = []

        def fake_evaluate_main(argv):
            captured_argv.append(argv)
            report_path = Path(argv[argv.index("--out-dir") + 1])
            report_path.mkdir(parents=True, exist_ok=True)
            manifest = pipeline_mod.load_manifest(Path(argv[argv.index("--manifest") + 1]))
            (report_path / f"{manifest.id}.translation-evaluation.json").write_text(
                json.dumps({"hard_gates_ok": True}), encoding="utf-8"
            )
            return 0

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(MANIFEST_YAML, encoding="utf-8")
            domain_yaml_path = tmp_path / "run-1.domain.yaml"
            domain_yaml_path.write_text("classes: {}\n", encoding="utf-8")
            translation_path = tmp_path / "run-1.translation.json"
            translation_path.write_text("{}", encoding="utf-8")
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text("{}", encoding="utf-8")
            other_run = tmp_path / "run-2.domain.yaml"
            other_run.write_text("classes: {}\n", encoding="utf-8")

            original_main = pipeline_mod.evaluate_mod.main
            pipeline_mod.evaluate_mod.main = fake_evaluate_main
            try:
                pipeline_mod._fix_round(
                    domain_yaml_path, translation_path, source_ir_path, manifest_path, tmp_path,
                    round_num=1, judges=1, round_trip_sample=1, cq_count=1,
                    stability_run_paths=[other_run],
                )
            finally:
                pipeline_mod.evaluate_mod.main = original_main

            self.assertEqual(len(captured_argv), 1)
            argv = captured_argv[0]
            self.assertIn("--stability-runs", argv)
            self.assertIn(str(other_run), argv)

    def test_no_stability_run_paths_omits_the_flag(self):
        captured_argv = []

        def fake_evaluate_main(argv):
            captured_argv.append(argv)
            report_path = Path(argv[argv.index("--out-dir") + 1])
            report_path.mkdir(parents=True, exist_ok=True)
            manifest = pipeline_mod.load_manifest(Path(argv[argv.index("--manifest") + 1]))
            (report_path / f"{manifest.id}.translation-evaluation.json").write_text(
                json.dumps({"hard_gates_ok": True}), encoding="utf-8"
            )
            return 0

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(MANIFEST_YAML, encoding="utf-8")
            domain_yaml_path = tmp_path / "run-1.domain.yaml"
            domain_yaml_path.write_text("classes: {}\n", encoding="utf-8")
            translation_path = tmp_path / "run-1.translation.json"
            translation_path.write_text("{}", encoding="utf-8")
            source_ir_path = tmp_path / "source_ir.json"
            source_ir_path.write_text("{}", encoding="utf-8")

            original_main = pipeline_mod.evaluate_mod.main
            pipeline_mod.evaluate_mod.main = fake_evaluate_main
            try:
                pipeline_mod._fix_round(
                    domain_yaml_path, translation_path, source_ir_path, manifest_path, tmp_path,
                    round_num=1, judges=1, round_trip_sample=1, cq_count=1,
                )
            finally:
                pipeline_mod.evaluate_mod.main = original_main

            self.assertNotIn("--stability-runs", captured_argv[0])


class RunPipelineDryRunTests(unittest.TestCase):
    def test_dry_run_skips_fetch_extracts_for_real_and_stops_before_compile_api_call(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(MANIFEST_YAML, encoding="utf-8")
            source_file = tmp_path / "source.ttl"
            source_file.write_text(TURTLE_FIXTURE, encoding="utf-8")
            out_dir = tmp_path / "out"

            rc = pipeline_mod.main(
                [
                    "--manifest", str(manifest_path), "--out-dir", str(out_dir),
                    "--source-file", str(source_file), "--dry-run",
                ]
            )

            self.assertEqual(rc, 0)
            # extract.py ran for real (deterministic, no network/API).
            source_ir_path = out_dir / "source_ir.json"
            self.assertTrue(source_ir_path.exists())
            ir = json.loads(source_ir_path.read_text(encoding="utf-8"))
            self.assertTrue(any(c["iri"] == "http://example.org/onto#Fan" for c in ir["classes"]))
            # compile.py stopped at its own --dry-run estimate -- no run-1
            # output was ever written, no fix-loop or final evaluate ran.
            self.assertFalse((out_dir / "run-1.domain.yaml").exists())
            self.assertFalse((out_dir / "eval-final").exists())


if __name__ == "__main__":
    unittest.main()
