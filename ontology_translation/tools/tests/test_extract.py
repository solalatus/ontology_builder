"""Tests for extract.py's deterministic RDF -> source IR extraction and
scope selection. Offline, in-memory Turtle fixtures only -- no network, no
LLM, exercising exactly the "do not ask an LLM to parse RDF" boundary."""

import tempfile
import unittest
from pathlib import Path

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))

from extract import extract_all, local_name, parse_graph, select_scope

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

    def test_no_roots_returns_full_extraction_unchanged(self):
        scoped = select_scope(self.ir, roots=[])
        self.assertEqual(scoped, self.ir)

    def test_max_depth_limits_traversal(self):
        # depth 0 selects only the direct root match itself, no parents/children.
        scoped = select_scope(self.ir, roots=["Fan"], max_depth=0)
        labels = {c["labels"][0] for c in scoped["classes"]}
        self.assertEqual(labels, {"Fan"})


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


def _parse(ttl_text: str):
    import rdflib

    graph = rdflib.Graph()
    graph.parse(data=ttl_text, format="turtle")
    return graph


if __name__ == "__main__":
    unittest.main()
