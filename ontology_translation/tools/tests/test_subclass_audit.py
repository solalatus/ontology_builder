"""Tests for subclass_audit.py (issue #155's five-domain audit). The unit
tests build a tiny synthetic ontology with one case per audit outcome; the
last test re-runs the real audit and checks the committed result is
current."""

import json
import unittest
from pathlib import Path

import sys as _sys

_sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import rdflib
from rdflib.namespace import OWL, RDF, RDFS

import subclass_audit as audit

EX = rdflib.Namespace("http://example.org/onto#")
AUDIT_JSON = Path(__file__).resolve().parents[2] / "results" / "subclass-audit" / "audit.json"


def _graph():
    g = rdflib.Graph()
    for name in ["Animal", "Bird", "Mammal", "Cat", "Dog", "Pet", "Kind", "Thing", "Rock", "Fish", "Shark"]:
        g.add((EX[name], RDF.type, OWL.Class))
        g.add((EX[name], RDFS.label, rdflib.Literal(name, lang="en")))
    g.add((EX.Bird, RDFS.subClassOf, EX.Animal))          # direct: Bird specializes Animal
    g.add((EX.Mammal, RDFS.subClassOf, EX.Animal))        # Mammal is unmapped...
    g.add((EX.Cat, RDFS.subClassOf, EX.Mammal))           # ...so Cat specializes Animal via 1 skipped
    g.add((EX.Dog, RDFS.subClassOf, EX.Animal))           # Dog was merged into the Animal class
    g.add((EX.Pet, RDFS.subClassOf, EX.Kind))             # Kind became a property -> folded parent
    g.add((EX.Rock, RDFS.subClassOf, EX.Thing))           # Thing is unmapped with no mapped ancestor
    g.add((EX.Fish, RDFS.subClassOf, EX.Animal))          # unmapped subtype, taxonomy_only
    g.add((EX.Shark, RDFS.subClassOf, EX.Animal))         # unmapped subtype, not listed at all
    restriction = rdflib.BNode()                          # OWL restriction: not taxonomy
    g.add((restriction, RDF.type, OWL.Restriction))
    g.add((EX.Bird, RDFS.subClassOf, restriction))
    g.add((EX.Bird, RDFS.subClassOf, OWL.Thing))          # owl:Thing is ignored
    return g


TRANSLATION = {
    "mappings": [
        {"target_path": "classes.Animal", "source_iris": [str(EX.Animal)]},
        {"target_path": "classes.Bird", "source_iris": [str(EX.Bird)]},
        {"target_path": "classes.Cat", "source_iris": [str(EX.Cat)]},
        {"target_path": "classes.Pet", "source_iris": [str(EX.Pet)]},
        {"target_path": "classes.Animal.properties.kind", "source_iris": [str(EX.Kind)]},
        {"target_path": "classes.Rock", "source_iris": [str(EX.Rock)]},
        {"target_path": "relationships[0]", "source_iris": ["http://example.org/onto#eats"]},
        # Dog's own mapping says it became Animal: a merge.
        {"target_path": "classes.Animal", "source_iris": [str(EX.Dog)]},
    ],
    "dispositions": [{"source_iri": str(EX.Fish), "disposition": "taxonomy_only", "note": "x"}],
}

DOMAIN = {
    "classes": {"Animal": {}, "Bird": {}, "Cat": {}, "Pet": {}, "Rock": {}},
    "relationships": [{"name": "eats", "from": "Bird", "to": "Animal"}],
}


class AuditRdfPartsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = audit.audit_rdf_parts("test", _graph(), TRANSLATION, DOMAIN, ["x.rdf"])
        cls.by_pair = {(c["subclass"], c["superclass"]): c for c in cls.result["candidates"]}

    def test_only_named_subclass_edges_are_counted(self):
        # 8 named edges; the restriction blank node and owl:Thing are excluded.
        self.assertEqual(self.result["named_subclassof_edges_in_source"], 8)

    def test_exactly_the_two_candidates(self):
        self.assertEqual(set(self.by_pair), {("Bird", "Animal"), ("Cat", "Animal")})

    def test_direct_candidate(self):
        c = self.by_pair[("Bird", "Animal")]
        self.assertEqual(c["kind"], "direct")
        self.assertEqual(c["source_paths"], ["Bird -> Animal"])

    def test_candidate_through_an_unmapped_intermediate(self):
        c = self.by_pair[("Cat", "Animal")]
        self.assertEqual(c["kind"], "via 1 skipped")
        self.assertEqual(c["source_paths"], ["Cat -> Mammal -> Animal"])

    def test_connectivity_flags(self):
        self.assertTrue(self.by_pair[("Bird", "Animal")]["already_related_to_parent"])
        self.assertFalse(self.by_pair[("Bird", "Animal")]["x_is_island"])
        self.assertTrue(self.by_pair[("Cat", "Animal")]["x_is_island"])
        self.assertFalse(self.by_pair[("Cat", "Animal")]["already_related_to_parent"])

    def test_connected_to_parent_follows_relationships_through_other_classes(self):
        self.assertTrue(self.by_pair[("Bird", "Animal")]["x_connected_to_parent"])   # directly related
        self.assertFalse(self.by_pair[("Cat", "Animal")]["x_connected_to_parent"])   # island
        domain = json.loads(json.dumps(DOMAIN))
        domain["relationships"].append({"name": "chases", "from": "Cat", "to": "Bird"})
        result = audit.audit_rdf_parts("test", _graph(), TRANSLATION, domain, ["x.rdf"])
        [cat] = [c for c in result["candidates"] if c["subclass"] == "Cat"]
        # Cat -> Bird -> Animal: connected, though not directly related.
        self.assertTrue(cat["x_connected_to_parent"])
        self.assertFalse(cat["already_related_to_parent"])
        self.assertFalse(cat["x_is_island"])

    def test_non_candidate_outcomes(self):
        o = self.result["upward_walk_outcomes"]
        self.assertEqual(o.get("parent merged into the same class"), 1)            # Dog -> Animal
        self.assertEqual(o.get("parent folded into a non-class element"), 1)       # Pet -> Kind
        # Rock -> Thing, and Animal itself (no parent at all).
        self.assertEqual(o.get("no mapped ancestor (parent outside translated scope)"), 2)
        [folded] = self.result["folded_parents"]
        self.assertEqual((folded["class"], folded["source_parent"]), ("Pet", "Kind"))
        self.assertEqual(folded["parent_became"], ["Animal.kind"])

    def test_latent_subtypes_grouped_by_disposition(self):
        # Mammal is unmapped too: it is a latent subtype as well, and its
        # disposition is not recorded either.
        self.assertEqual(
            self.result["latent_subtypes_by_disposition"],
            {"taxonomy_only": 1, "not listed in translation.json": 2},
        )

    def test_a_pair_reached_by_two_paths_is_listed_once_by_its_shortest_path(self):
        # The walk is breadth-first and visits each ancestor once, so the
        # nearest route wins and the longer one is not reported separately.
        g = _graph()
        g.add((EX.Cat, RDFS.subClassOf, EX.Animal))  # now also direct
        result = audit.audit_rdf_parts("test", g, TRANSLATION, DOMAIN, ["x.rdf"])
        cats = [c for c in result["candidates"] if c["subclass"] == "Cat"]
        self.assertEqual(len(cats), 1)
        self.assertEqual(cats[0]["kind"], "direct")
        self.assertEqual(cats[0]["source_paths"], ["Cat -> Animal"])

    def test_two_source_iris_of_one_class_each_contribute_their_path(self):
        # Two source classes map to the same target class Cat: both routes
        # to Animal are kept, and the pair is still listed once.
        g = _graph()
        g.add((EX.Kitten, RDF.type, OWL.Class))
        g.add((EX.Kitten, RDFS.label, rdflib.Literal("Kitten", lang="en")))
        g.add((EX.Kitten, RDFS.subClassOf, EX.Animal))
        translation = json.loads(json.dumps(TRANSLATION))
        translation["mappings"].append({"target_path": "classes.Cat", "source_iris": [str(EX.Kitten)]})
        result = audit.audit_rdf_parts("test", g, translation, DOMAIN, ["x.rdf"])
        [cat] = [c for c in result["candidates"] if c["subclass"] == "Cat"]
        self.assertEqual(cat["kind"], "direct")
        self.assertEqual(cat["source_paths"], ["Cat -> Mammal -> Animal", "Kitten -> Animal"])


class SecondaryCitationTests(unittest.TestCase):
    """The compiler sometimes lists supporting evidence after the primary
    source IRI (iof-supply-chain's classes.Trailer cites [Trailer,
    Container]). Only the first-listed IRI says what a class came from."""

    def test_a_parent_cited_as_evidence_does_not_become_the_child_class(self):
        translation = json.loads(json.dumps(TRANSLATION))
        # Cat's mapping also cites Animal (its ancestor) as evidence.
        translation["mappings"][2]["source_iris"].append(str(EX.Animal))
        result = audit.audit_rdf_parts("test", _graph(), translation, DOMAIN, ["x.rdf"])
        pairs = {(c["subclass"], c["superclass"]) for c in result["candidates"]}
        # Before the fix this produced Bird -> Cat, Cat -> Cat merges, etc.
        self.assertEqual(pairs, {("Bird", "Animal"), ("Cat", "Animal")})

    def test_identity_index_keeps_only_first_listed_iris(self):
        identity, secondary = audit.index_mappings({"mappings": [
            {"target_path": "classes.Trailer", "source_iris": ["T", "C"]},
            {"target_path": "classes.Container", "source_iris": ["C"]},
            {"target_path": "classes.Trailer.properties.axles", "source_iris": ["axles", "T"]},
        ]})
        self.assertEqual(identity, {"T": [("class", "Trailer")], "C": [("class", "Container")],
                                    "axles": [("property", "Trailer.axles")]})
        self.assertEqual(secondary, {"C": ["classes.Trailer"], "T": ["classes.Trailer.properties.axles"]})

    def test_an_ancestor_cited_only_as_evidence_is_reported_not_counted(self):
        # Brick's case: Space's mapping cites [brick:Space, rec:Space], and
        # Building's real parent chain reaches rec:Space, not brick:Space.
        g = _graph()
        for name in ["Pebble", "Stone"]:
            g.add((EX[name], RDF.type, OWL.Class))
            g.add((EX[name], RDFS.label, rdflib.Literal(name, lang="en")))
        g.add((EX.Pebble, RDFS.subClassOf, EX.Stone))
        translation = json.loads(json.dumps(TRANSLATION))
        translation["mappings"].append({"target_path": "classes.Pebble", "source_iris": [str(EX.Pebble)]})
        translation["mappings"][5]["source_iris"].append(str(EX.Stone))  # classes.Rock cites Stone
        result = audit.audit_rdf_parts("test", g, translation, DOMAIN, ["x.rdf"])
        self.assertNotIn(("Pebble", "Rock"), {(c["subclass"], c["superclass"]) for c in result["candidates"]})
        self.assertEqual(result["secondary_ancestor_hits"],
                         [{"subclass": "Pebble", "cited_by_class": "Rock", "source_path": "Pebble -> Stone"}])
        self.assertIn("Stone (cited by classes.Rock)", result["secondary_only_citations"])


class AuditItopsPartsTests(unittest.TestCase):
    def _run(self, predicates):
        original = {
            "classes": {"incident": {"label": "Incident"}, "majorIncident": {"label": "Major Incident"},
                        "ghost": {"label": "Ghost"}},
            "predicates": predicates,
        }
        domain = {"classes": {"Incident": {}, "MajorIncident": {}},
                  "relationships": [{"name": "escalatedFrom", "from": "MajorIncident", "to": "Incident"}]}
        return audit.audit_itops_parts(original, domain, ["x.yaml"])

    def test_is_a_predicates_become_candidates_with_capitalised_class_names(self):
        result = self._run([
            {"label": "is a", "from": "majorIncident", "to": "incident"},
            {"label": "is assigned to", "from": "incident", "to": "majorIncident"},
        ])
        [c] = result["candidates"]
        self.assertEqual((c["subclass"], c["superclass"], c["kind"]), ("MajorIncident", "Incident", "direct"))
        self.assertTrue(c["already_related_to_parent"])
        self.assertTrue(c["x_connected_to_parent"])
        self.assertEqual(c["source_paths"], ["Major Incident -> Incident"])
        self.assertEqual(result["named_subclassof_edges_in_source"], 1)

    def test_dict_shaped_predicates_and_missing_endpoints(self):
        result = self._run({"p1": {"label": "is a", "from": "ghost", "to": "incident"}})
        self.assertEqual(result["candidates"], [])
        self.assertEqual(result["is_a_with_missing_endpoint"], [{"subclass": "Ghost", "superclass": "Incident"}])


class CommittedAuditIsCurrentTests(unittest.TestCase):
    def test_committed_audit_json_matches_a_fresh_run(self):
        committed = json.loads(AUDIT_JSON.read_text(encoding="utf-8"))
        self.assertEqual(committed, json.loads(json.dumps(audit.run_audit(), ensure_ascii=False)))


if __name__ == "__main__":
    unittest.main()


# --- The reviewer classification and the generated report -----------------

import yaml  # noqa: E402

import subclass_audit_report as report  # noqa: E402

CLASSIFICATION = AUDIT_JSON.parent / "classification.yaml"
REPORT_MD = AUDIT_JSON.parent / "REPORT.md"


class ClassificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.audit = json.loads(AUDIT_JSON.read_text(encoding="utf-8"))
        cls.classification = yaml.safe_load(CLASSIFICATION.read_text(encoding="utf-8"))

    def test_covers_exactly_the_audits_candidate_pairs(self):
        self.assertEqual(set(self.classification["pairs"]), {d["domain"] for d in self.audit["domains"]})
        for d in self.audit["domains"]:
            with self.subTest(domain=d["domain"]):
                listed = [(p["sub"], p["super"]) for p in self.classification["pairs"][d["domain"]]]
                self.assertEqual(len(listed), len(set(listed)), "no pair listed twice")
                self.assertEqual(set(listed), {(c["subclass"], c["superclass"]) for c in d["candidates"]})

    def test_every_pair_has_a_known_category_and_a_reason(self):
        self.assertEqual(self.classification["categories"], report.CATEGORIES)
        for domain, pairs in self.classification["pairs"].items():
            for p in pairs:
                with self.subTest(domain=domain, pair=(p["sub"], p["super"])):
                    # Exactly these keys: an unquoted comma in a flow mapping
                    # silently splits the reason into a stray key.
                    self.assertEqual(set(p), {"sub", "super", "category", "why"})
                    self.assertIn(p["category"], report.CATEGORIES)
                    self.assertTrue(str(p["why"]).strip())


class ComponentTests(unittest.TestCase):
    def test_components_and_dropped_members(self):
        classes = ["A", "B", "C", "D", "E"]
        self.assertEqual(report.components(classes, [("A", "B")]), [2, 1, 1, 1])
        self.assertEqual(report.component_sets(classes, [("A", "B"), ("C", "D")]), [["A", "B"], ["C", "D"], ["E"]])
        # Folding D into C: still joins, but D is no longer a member.
        self.assertEqual(report.components(classes, [("A", "B"), ("C", "D")], drop={"D"}), [2, 1, 1])
        # A dropped class still joins otherwise separate components.
        self.assertEqual(report.components(classes, [("A", "D"), ("D", "E")], drop={"D"}), [2, 1, 1])


class CommittedReportIsCurrentTests(unittest.TestCase):
    def test_committed_report_is_exactly_what_the_generator_renders(self):
        audit_data = json.loads(AUDIT_JSON.read_text(encoding="utf-8"))
        classification = yaml.safe_load(CLASSIFICATION.read_text(encoding="utf-8"))
        self.assertEqual(REPORT_MD.read_text(encoding="utf-8"), report.render(audit_data, classification))
