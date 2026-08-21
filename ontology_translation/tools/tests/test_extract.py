"""Tests for extract.py's deterministic RDF -> source IR extraction and
scope selection. Offline, in-memory Turtle fixtures only -- no network, no
LLM, exercising exactly the "do not ask an LLM to parse RDF" boundary."""

import tempfile
import unittest
from pathlib import Path

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

from extract import discover_annotation_predicates, extract_all, local_name, main, parse_graph, parse_graphs, select_scope

SAMPLE_TTL = """
@prefix : <http://example.org/onto#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .

<http://example.org/onto> a owl:Ontology ;
    owl:imports <http://example.org/upstream> .

:Equipment a owl:Class ;
    rdfs:label "Equipment" ;
    rdfs:comment "A piece of HVAC equipment." .

:Fan a owl:Class ;
    rdfs:label "Fan" ;
    skos:altLabel "Blower" ;
    rdfs:comment "A device that moves air." ;
    rdfs:subClassOf :Equipment .

:Damper a owl:Class ;
    rdfs:label "Damper" ;
    rdfs:subClassOf :Equipment .

:UnrelatedThing a owl:Class ;
    rdfs:label "Unrelated Thing" .

:Point a owl:Class ;
    rdfs:label "Point" .

:hasPoint a owl:ObjectProperty ;
    rdfs:label "hasPoint" ;
    rdfs:domain :Equipment ;
    rdfs:range :Point ;
    owl:inverseOf :isPointOf .

:isPointOf a owl:ObjectProperty ;
    rdfs:label "isPointOf" .

:status a owl:DatatypeProperty ;
    rdfs:label "status" ;
    rdfs:domain :Fan .

:FanStatusEnum a owl:Class ;
    owl:oneOf ( :On :Off ) .

:onlyPoints a owl:Restriction ;
    owl:onProperty :hasPoint ;
    owl:someValuesFrom :Point .
"""


class LocalNameTests(unittest.TestCase):
    def test_fragment_iri(self):
        self.assertEqual(local_name("http://example.org/onto#Fan"), "Fan")

    def test_path_iri(self):
        self.assertEqual(local_name("http://example.org/onto/Fan"), "Fan")

    def test_no_separator_returns_whole_iri(self):
        self.assertEqual(local_name("Fan"), "Fan")


class ExtractAllTests(unittest.TestCase):
    def setUp(self):
        self.graph = _parse(SAMPLE_TTL)
        self.ir = extract_all(self.graph, "test-onto")

    def test_class_count_and_labels(self):
        by_label = {c["labels"][0]: c for c in self.ir["classes"]}
        self.assertEqual(
            set(by_label.keys()),
            {"Equipment", "Fan", "Damper", "Unrelated Thing", "Point", "FanStatusEnum"},
        )

    def test_alt_labels_captured(self):
        fan = next(c for c in self.ir["classes"] if c["labels"][0] == "Fan")
        self.assertEqual(fan["altLabels"], ["Blower"])

    def test_definitions_captured(self):
        fan = next(c for c in self.ir["classes"] if c["labels"][0] == "Fan")
        self.assertEqual(fan["definitions"], ["A device that moves air."])

    def test_subclass_parents_captured(self):
        fan = next(c for c in self.ir["classes"] if c["labels"][0] == "Fan")
        self.assertEqual(len(fan["parents"]), 1)
        self.assertTrue(fan["parents"][0].endswith("Equipment"))

    def test_class_without_label_falls_back_to_local_name(self):
        # FanStatusEnum has no rdfs:label -- label must fall back to the IRI's local name.
        enum_class = next(c for c in self.ir["classes"] if c["iri"].endswith("FanStatusEnum"))
        self.assertEqual(enum_class["labels"], ["FanStatusEnum"])

    def test_object_property_domain_range_and_inverse(self):
        has_point = next(p for p in self.ir["object_properties"] if p["labels"][0] == "hasPoint")
        self.assertTrue(has_point["domain"][0].endswith("Equipment"))
        self.assertTrue(has_point["range"][0].endswith("Point"))
        self.assertTrue(has_point["inverseOf"][0].endswith("isPointOf"))

    def test_datatype_property_extracted(self):
        names = [p["labels"][0] for p in self.ir["datatype_properties"]]
        self.assertIn("status", names)

    def test_enumeration_members_extracted(self):
        self.assertEqual(len(self.ir["enumerations"]), 1)
        members = self.ir["enumerations"][0]["members"]
        self.assertEqual({local_name(m) for m in members}, {"On", "Off"})

    def test_restriction_extracted(self):
        self.assertEqual(len(self.ir["restrictions"]), 1)
        restriction = self.ir["restrictions"][0]
        self.assertTrue(restriction["onProperty"].endswith("hasPoint"))
        self.assertEqual(restriction["constraint"]["type"], "someValuesFrom")

    def test_import_extracted(self):
        self.assertEqual(len(self.ir["imports"]), 1)
        self.assertEqual(self.ir["imports"][0]["imports"], "http://example.org/upstream")

    def test_no_source_candidate_is_silently_dropped(self):
        # Every class/property/enum/restriction/import subject that appears
        # in the graph must appear exactly once across the extraction --
        # this is the deterministic half of "no source candidate may
        # silently disappear" (the LLM-side disposition tracking is #102's
        # translation.json, tested separately in test_compile.py).
        total = sum(len(v) for v in self.ir.values())
        self.assertEqual(total, 6 + 2 + 1 + 1 + 1 + 1)  # classes, object+datatype props, enum, restriction, import


CUSTOM_ANNOTATION_TTL = """
@prefix : <http://example.org/onto#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix acme: <http://example.org/acme-annotation-vocab#> .

:WidgetAssembly a owl:Class ;
    rdfs:label "Widget Assembly" ;
    acme:naturalLanguageDefinition "a component that is joined from parts to form one working unit" ;
    acme:explanatoryNote "used across the whole widget product line" ;
    acme:synonym "assembled widget" ;
    acme:acronym "WA" ;
    acme:unrelatedAnnotation "should not be captured as either a definition or an alt-label" .
"""


class CustomAnnotationVocabularyTests(unittest.TestCase):
    # Issue #108 (IOF Maintenance): found for real that IOF's own annotation
    # vocabulary mints its own predicates for definition/synonym/acronym
    # roles instead of reusing rdfs:comment/skos:definition/skos:altLabel --
    # every one of IOF Maintenance's 20 classes came out of extraction with
    # `definitions: []` despite 46 real definition elements sitting right in
    # the source file. Rather than hardcode IOF's specific IRIs (which would
    # only ever fix the *next* ontology already pointed at, not "whatever
    # ontology possible"), extract.py discovers ANY ontology's own custom
    # annotation predicates by naming convention. This fixture deliberately
    # uses a fictional `acme:` vocabulary, not IOF's own, to prove the
    # mechanism is genuinely general rather than IOF-specific.
    def setUp(self):
        self.ir = extract_all(_parse(CUSTOM_ANNOTATION_TTL), "test-onto")
        self.widget = self.ir["classes"][0]

    def test_definition_shaped_predicate_captured(self):
        self.assertIn(
            "a component that is joined from parts to form one working unit",
            self.widget["definitions"],
        )

    def test_note_shaped_predicate_captured_as_definition(self):
        self.assertIn("used across the whole widget product line", self.widget["definitions"])

    def test_synonym_shaped_predicate_captured_as_alt_label(self):
        self.assertIn("assembled widget", self.widget["altLabels"])

    def test_acronym_shaped_predicate_captured_as_alt_label(self):
        self.assertIn("WA", self.widget["altLabels"])

    def test_unmatched_custom_predicate_is_not_captured_at_all(self):
        # The naming-convention heuristic must stay conservative: a custom
        # annotation predicate whose name matches neither pattern is simply
        # not recognized (better to miss an unconventionally-named
        # annotation than to guess wrong and pollute definitions/altLabels
        # with unrelated text).
        self.assertNotIn("should not be captured as either a definition or an alt-label", self.widget["definitions"])
        self.assertNotIn("should not be captured as either a definition or an alt-label", self.widget["altLabels"])

    def test_discover_annotation_predicates_excludes_well_known_predicates(self):
        graph = _parse(SAMPLE_TTL)
        definition_preds, alt_label_preds = discover_annotation_predicates(graph)
        # SAMPLE_TTL only uses rdfs:comment/skos:altLabel, both already
        # handled explicitly -- nothing new should be discovered here.
        self.assertEqual(definition_preds, set())
        self.assertEqual(alt_label_preds, set())


class SelectScopeTests(unittest.TestCase):
    def setUp(self):
        self.ir = extract_all(_parse(SAMPLE_TTL), "test-onto")

    def test_scope_pulls_in_parent_and_siblings(self):
        scoped = select_scope(self.ir, roots=["Fan"])
        labels = {c["labels"][0] for c in scoped["classes"]}
        self.assertEqual(labels, {"Fan", "Equipment", "Damper"})

    def test_scope_excludes_unrelated_class(self):
        scoped = select_scope(self.ir, roots=["Fan"])
        labels = {c["labels"][0] for c in scoped["classes"]}
        self.assertNotIn("Unrelated Thing", labels)
        self.assertNotIn("Point", labels)

    def test_scope_includes_property_with_domain_in_scope(self):
        scoped = select_scope(self.ir, roots=["Fan"])
        names = {p["labels"][0] for p in scoped["object_properties"]}
        self.assertIn("hasPoint", names)

    def test_scope_includes_property_without_domain_or_range_declared(self):
        # isPointOf has no rdfs:domain/rdfs:range at all in the fixture --
        # common in SHACL-styled ontologies (Brick included) that constrain
        # relationships via property shapes rather than domain/range
        # triples. There's nothing to filter by, so it must be included
        # rather than silently dropped, even though it doesn't match "Fan".
        scoped = select_scope(self.ir, roots=["Fan"])
        names = {p["labels"][0] for p in scoped["object_properties"]}
        self.assertIn("isPointOf", names)

    def test_no_roots_returns_full_extraction_unchanged(self):
        scoped = select_scope(self.ir, roots=[])
        self.assertEqual(scoped, self.ir)

    def test_max_depth_limits_traversal(self):
        # depth 0 selects only the direct root match itself, no parents/children.
        scoped = select_scope(self.ir, roots=["Fan"], max_depth=0)
        labels = {c["labels"][0] for c in scoped["classes"]}
        self.assertEqual(labels, {"Fan"})


EQUIVALENT_CLASS_TTL = """
@prefix : <http://example.org/onto#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

:AHU a owl:Class ;
    rdfs:label "AHU" ;
    owl:equivalentClass :AirHandlingUnit .

:AirHandlingUnit a owl:Class ;
    rdfs:label "Air Handling Unit" .
"""


class EquivalentClassTests(unittest.TestCase):
    def test_equivalent_class_label_folded_into_alt_labels(self):
        # owl:equivalentClass is a standard OWL construct many real
        # ontologies (Brick included -- "AHU" equivalentClass
        # "Air_Handling_Unit") use for alternate names of the same concept.
        ir = extract_all(_parse(EQUIVALENT_CLASS_TTL), "test-onto")
        ahu = next(c for c in ir["classes"] if c["labels"][0] == "AHU")
        self.assertIn("Air Handling Unit", ahu["altLabels"])


class ParseGraphFromFileTests(unittest.TestCase):
    def test_parses_a_turtle_file_on_disk(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "sample.ttl"
            path.write_text(SAMPLE_TTL, encoding="utf-8")
            graph = parse_graph(path, fmt="turtle")
        self.assertGreater(len(graph), 0)

    def test_format_is_guessed_from_extension_when_unspecified(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "sample.ttl"
            path.write_text(SAMPLE_TTL, encoding="utf-8")
            graph = parse_graph(path)
        self.assertGreater(len(graph), 0)


# A second file, disjoint from SAMPLE_TTL, whose one class's parent
# (:Equipment) is only declared in SAMPLE_TTL -- the same real shape found
# translating FIBO Loans (issue #110): FIBO's LOAN module declares "Loan"
# etc. in one file but leaves "Lender" declared only in a separate,
# owl:imports-linked FBC file.
SPLIT_TTL = """
@prefix : <http://example.org/onto#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

:Servicer a owl:Class ;
    rdfs:label "Servicer" ;
    rdfs:comment "An agent that services equipment." ;
    rdfs:subClassOf :Equipment .
"""


class ParseGraphsMultiFileTests(unittest.TestCase):
    """extract.py's own multi-file support (issue #110's general fix, not
    FIBO-specific -- any ontology split across owl:imports-linked files
    hits this same shape)."""

    def _write(self, tmp_path: Path, name: str, text: str) -> Path:
        path = tmp_path / name
        path.write_text(text, encoding="utf-8")
        return path

    def test_two_files_merge_into_one_graph(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = self._write(tmp_path, "a.ttl", SAMPLE_TTL)
            b = self._write(tmp_path, "b.ttl", SPLIT_TTL)
            graph = parse_graphs([a, b], fmt="turtle")

        ir = extract_all(graph, "test-onto")
        labels = {c["labels"][0] for c in ir["classes"]}
        self.assertIn("Fan", labels)  # from a.ttl
        self.assertIn("Servicer", labels)  # from b.ttl

    def test_cross_file_parent_edge_is_resolved_by_select_scope(self):
        # Servicer's rdfs:subClassOf :Equipment only makes sense once both
        # files are in the same graph -- proves select_scope's BFS walks
        # across the merged files, not just within either one alone.
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = self._write(tmp_path, "a.ttl", SAMPLE_TTL)
            b = self._write(tmp_path, "b.ttl", SPLIT_TTL)
            graph = parse_graphs([a, b], fmt="turtle")

        ir = extract_all(graph, "test-onto")
        scoped = select_scope(ir, ["Servicer"])
        labels = {c["labels"][0] for c in scoped["classes"]}
        self.assertIn("Servicer", labels)
        self.assertIn("Equipment", labels)

    def test_single_file_list_behaves_like_parse_graph(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = self._write(tmp_path, "a.ttl", SAMPLE_TTL)
            merged = parse_graphs([a], fmt="turtle")
            single = parse_graph(a, fmt="turtle")
        self.assertEqual(len(merged), len(single))


class MainCliMaxDepthTests(unittest.TestCase):
    """Regression coverage for a real bug: SourceManifest never parsed
    scope.max_depth at all, and extract.py's CLI only ever respected a
    separate, easy-to-forget --max-depth flag -- silently unlimited whenever
    that flag wasn't repeated by hand, even though the manifest documented a
    specific depth as part of its reproducibility record. Found by actually
    re-running the real Brick HVAC pipeline from a clean slate: the exact
    same manifest/source/roots produced 1622 classes instead of the
    originally-accepted 81. SelectScopeTests above only ever tested the
    library function directly with an explicit max_depth kwarg -- it could
    never have caught a CLI *wiring* bug, which is why this exists as a
    real end-to-end main() invocation instead."""

    def _write_manifest(self, tmp_path: Path, max_depth_line: str = "") -> Path:
        manifest_path = tmp_path / "source-manifest.yaml"
        manifest_path.write_text(
            "id: test-onto\n"
            "source_url: https://example.org/onto.ttl\n"
            "scope:\n"
            f"{max_depth_line}"
            "  roots:\n"
            "    - Fan\n"
            "compiler:\n"
            "  prompt_version: compiler-prompt\n"
            "  runs: 1\n",
            encoding="utf-8",
        )
        return manifest_path

    def test_manifest_max_depth_is_applied_without_a_cli_flag(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            ttl_path = tmp_path / "sample.ttl"
            ttl_path.write_text(SAMPLE_TTL, encoding="utf-8")
            manifest_path = self._write_manifest(tmp_path, "  max_depth: 0\n")
            out_path = tmp_path / "out.json"

            rc = main(["--input", str(ttl_path), "--manifest", str(manifest_path), "--out", str(out_path)])

            self.assertEqual(rc, 0)
            import json

            ir = json.loads(out_path.read_text(encoding="utf-8"))
            labels = {c["labels"][0] for c in ir["classes"]}
            # max_depth: 0 in the manifest, no --max-depth on the command
            # line -- must select only the root match itself, not its
            # parent/sibling too. Before this fix, the CLI ignored the
            # manifest field entirely and this would come back unlimited.
            self.assertEqual(labels, {"Fan"})

    def test_explicit_cli_flag_overrides_the_manifest_value(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            ttl_path = tmp_path / "sample.ttl"
            ttl_path.write_text(SAMPLE_TTL, encoding="utf-8")
            manifest_path = self._write_manifest(tmp_path, "  max_depth: 0\n")
            out_path = tmp_path / "out.json"

            rc = main(
                ["--input", str(ttl_path), "--manifest", str(manifest_path), "--out", str(out_path), "--max-depth", "5"]
            )

            self.assertEqual(rc, 0)
            import json

            ir = json.loads(out_path.read_text(encoding="utf-8"))
            labels = {c["labels"][0] for c in ir["classes"]}
            self.assertEqual(labels, {"Fan", "Equipment", "Damper"})

    def test_manifest_without_max_depth_stays_unlimited(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            ttl_path = tmp_path / "sample.ttl"
            ttl_path.write_text(SAMPLE_TTL, encoding="utf-8")
            manifest_path = self._write_manifest(tmp_path)  # no max_depth line at all
            out_path = tmp_path / "out.json"

            rc = main(["--input", str(ttl_path), "--manifest", str(manifest_path), "--out", str(out_path)])

            self.assertEqual(rc, 0)
            import json

            ir = json.loads(out_path.read_text(encoding="utf-8"))
            labels = {c["labels"][0] for c in ir["classes"]}
            self.assertEqual(labels, {"Fan", "Equipment", "Damper"})


class MainCliMultiInputTests(unittest.TestCase):
    """End-to-end CLI coverage for --input accepting more than one file
    (issue #110's general fix)."""

    def test_two_input_files_are_merged_before_extraction(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            a = tmp_path / "a.ttl"
            b = tmp_path / "b.ttl"
            a.write_text(SAMPLE_TTL, encoding="utf-8")
            b.write_text(SPLIT_TTL, encoding="utf-8")
            manifest_path = tmp_path / "source-manifest.yaml"
            manifest_path.write_text(
                "id: test-onto\n"
                "source_url: https://example.org/a.ttl\n"
                "extra_source_urls:\n"
                "  - https://example.org/b.ttl\n"
                "scope:\n"
                "  roots:\n"
                "    - Servicer\n"
                "compiler:\n"
                "  prompt_version: compiler-prompt\n"
                "  runs: 1\n",
                encoding="utf-8",
            )
            out_path = tmp_path / "out.json"

            rc = main(["--input", str(a), str(b), "--manifest", str(manifest_path), "--out", str(out_path)])

            self.assertEqual(rc, 0)
            import json

            ir = json.loads(out_path.read_text(encoding="utf-8"))
            labels = {c["labels"][0] for c in ir["classes"]}
            # Servicer only exists in b.ttl; its parent Equipment only in
            # a.ttl -- both present (plus Equipment's other real children,
            # Fan/Damper, per select_scope's own sibling-inclusion rule)
            # proves the two files were genuinely merged into one graph
            # before scope selection ran, not extracted independently.
            self.assertEqual(labels, {"Servicer", "Equipment", "Fan", "Damper"})


def _parse(ttl_text: str):
    import rdflib

    graph = rdflib.Graph()
    graph.parse(data=ttl_text, format="turtle")
    return graph


if __name__ == "__main__":
    unittest.main()
