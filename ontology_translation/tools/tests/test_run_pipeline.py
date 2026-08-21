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


RDF_XML_FIXTURE = """<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns:ex="http://example.org/onto#">
  <owl:Class rdf:about="http://example.org/onto#Widget">
    <rdfs:label>Widget</rdfs:label>
    <rdfs:comment>A generic manufactured item.</rdfs:comment>
  </owl:Class>
</rdf:RDF>
"""


class GuessSourceSuffixTests(unittest.TestCase):
    # Issue #108: run_pipeline.py used to hardcode every auto-fetched source
    # to `source.ttl` regardless of the real serialization -- harmless for a
    # genuinely-Turtle source (Brick), but silently WRONG for RDF/XML (a
    # very common ontology serialization, including some real IOF modules):
    # rdflib's own format auto-detection trusts a recognized extension over
    # the actual bytes, so RDF/XML content saved as `.ttl` gets parsed as
    # Turtle and crashes with a syntax error nowhere near the real problem.
    def test_rdf_extension_preserved(self):
        self.assertEqual(pipeline_mod._guess_source_suffix("https://example.org/onto/Thing.rdf"), ".rdf")

    def test_turtle_extension_preserved(self):
        self.assertEqual(pipeline_mod._guess_source_suffix("https://example.org/onto/Thing.ttl"), ".ttl")

    def test_owl_extension_preserved(self):
        self.assertEqual(pipeline_mod._guess_source_suffix("https://example.org/onto/Thing.owl"), ".owl")

    def test_query_string_does_not_leak_into_the_suffix(self):
        self.assertEqual(pipeline_mod._guess_source_suffix("https://example.org/onto/Thing.rdf?raw=true"), ".rdf")

    def test_no_extension_falls_back_to_no_forced_suffix(self):
        # No extension to trust -- forcing one anyway would be just as
        # misleading as the original `.ttl` bug this fix replaces. Empty is
        # honest: rdflib's own last-resort behavior (try Turtle, fail with an
        # actionable message) is no worse than before, and never silently
        # wrong the way a forced-but-incorrect extension is.
        self.assertEqual(pipeline_mod._guess_source_suffix("https://example.org/ontology-download"), "")


class AutoFetchSuffixIntegrationTests(unittest.TestCase):
    # End-to-end regression for the same bug via the real fetch -> extract
    # chain (a file:// URL, so this stays offline/free/no-credentials like
    # every other test here) -- proves an RDF/XML source downloaded through
    # run_pipeline.py's own auto-fetch path (not --source-file, which always
    # bypassed this bug) lands on disk with the right extension and actually
    # parses, rather than being silently mis-named and crashing at extract.
    def test_rdf_xml_source_survives_the_real_auto_fetch_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            source_path = tmp_path / "upstream.rdf"
            source_path.write_text(RDF_XML_FIXTURE, encoding="utf-8")
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                f"id: test-domain\nsource_url: {source_path.as_uri()}\nscope:\n  roots: []\ncompiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
                encoding="utf-8",
            )
            out_dir = tmp_path / "out"

            rc = pipeline_mod.main(
                ["--manifest", str(manifest_path), "--out-dir", str(out_dir), "--dry-run"]
            )

            self.assertEqual(rc, 0)
            fetched = list(out_dir.glob("source.*"))
            self.assertEqual(len(fetched), 1, f"expected exactly one fetched source file, got {fetched}")
            self.assertEqual(fetched[0].suffix, ".rdf")
            source_ir = json.loads((out_dir / "source_ir.json").read_text(encoding="utf-8"))
            self.assertEqual([c["iri"] for c in source_ir["classes"]], ["http://example.org/onto#Widget"])


RDF_XML_FIXTURE_2 = """<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns:ex="http://example.org/onto#">
  <owl:Class rdf:about="http://example.org/onto#Manufacturer">
    <rdfs:label>Manufacturer</rdfs:label>
    <rdfs:comment>An agent that manufactures widgets.</rdfs:comment>
  </owl:Class>
</rdf:RDF>
"""


class MultiFileAutoFetchIntegrationTests(unittest.TestCase):
    """End-to-end regression for issue #110's general fix: a manifest with
    extra_source_urls must fetch every file (into a directory, via
    fetch.py's own multi-file support) and feed all of them into extract.py
    as a single merged graph, through run_pipeline.py's real auto-fetch
    path -- not just the library functions in isolation. Offline (file://
    URLs), same convention as AutoFetchSuffixIntegrationTests above."""

    def test_both_files_are_fetched_and_merged(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a_path = tmp_path / "widget.rdf"
            b_path = tmp_path / "manufacturer.rdf"
            a_path.write_text(RDF_XML_FIXTURE, encoding="utf-8")
            b_path.write_text(RDF_XML_FIXTURE_2, encoding="utf-8")
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                f"id: test-domain\nsource_url: {a_path.as_uri()}\n"
                f"extra_source_urls:\n  - {b_path.as_uri()}\n"
                "scope:\n  roots: []\ncompiler:\n  prompt_version: compiler-prompt\n  runs: 1\n",
                encoding="utf-8",
            )
            out_dir = tmp_path / "out"

            rc = pipeline_mod.main(
                ["--manifest", str(manifest_path), "--out-dir", str(out_dir), "--dry-run"]
            )

            self.assertEqual(rc, 0)
            fetched = sorted((out_dir / "sources").glob("*"))
            self.assertEqual([p.name for p in fetched], ["manufacturer.rdf", "widget.rdf"])
            source_ir = json.loads((out_dir / "source_ir.json").read_text(encoding="utf-8"))
            iris = {c["iri"] for c in source_ir["classes"]}
            self.assertEqual(
                iris, {"http://example.org/onto#Widget", "http://example.org/onto#Manufacturer"}
            )


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


class FixRoundConfirmationJudgesTests(unittest.TestCase):
    """Issue #117: --confirmation-judges must reach evaluate.py's argv when
    the caller passes one, and stay omitted (falling back to evaluate.py's
    own default) when not -- same forwarding shape as --stability-runs."""

    @staticmethod
    def _fake_evaluate_main(captured_argv):
        def fake(argv):
            captured_argv.append(argv)
            report_path = Path(argv[argv.index("--out-dir") + 1])
            report_path.mkdir(parents=True, exist_ok=True)
            manifest = pipeline_mod.load_manifest(Path(argv[argv.index("--manifest") + 1]))
            (report_path / f"{manifest.id}.translation-evaluation.json").write_text(
                json.dumps({"hard_gates_ok": True}), encoding="utf-8"
            )
            return 0

        return fake

    def test_confirmation_judges_is_forwarded_when_given(self):
        captured_argv = []
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
            pipeline_mod.evaluate_mod.main = self._fake_evaluate_main(captured_argv)
            try:
                pipeline_mod._fix_round(
                    domain_yaml_path, translation_path, source_ir_path, manifest_path, tmp_path,
                    round_num=1, judges=1, round_trip_sample=1, cq_count=1, confirmation_judges=4,
                )
            finally:
                pipeline_mod.evaluate_mod.main = original_main

            argv = captured_argv[0]
            self.assertIn("--confirmation-judges", argv)
            self.assertEqual(argv[argv.index("--confirmation-judges") + 1], "4")

    def test_confirmation_judges_omitted_when_not_given(self):
        captured_argv = []
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
            pipeline_mod.evaluate_mod.main = self._fake_evaluate_main(captured_argv)
            try:
                pipeline_mod._fix_round(
                    domain_yaml_path, translation_path, source_ir_path, manifest_path, tmp_path,
                    round_num=1, judges=1, round_trip_sample=1, cq_count=1,
                )
            finally:
                pipeline_mod.evaluate_mod.main = original_main

            self.assertNotIn("--confirmation-judges", captured_argv[0])


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
