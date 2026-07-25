"""Tests for load_edge_list.py, standard library only (unittest).

Reuses the same fixture files under tests/fixtures/ that the JS test suite
(tests/phase6.spec.mjs) exercises the app's own importer against, so both
the Python reference and the JS importer are checked against one shared
set of example files rather than two that could quietly drift apart.

Run with: python3 -m unittest tools/test_load_edge_list.py
"""

import os
import tempfile
import unittest

from load_edge_list import load_edge_list

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures")


def fixture(name):
    return os.path.join(FIXTURES_DIR, name)


def load_text(text):
    """Writes `text` to a temp file and loads it, for cases with no fixture."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(text)
        path = f.name
    try:
        return load_edge_list(path)
    finally:
        os.unlink(path)


class TestSpecExample(unittest.TestCase):
    """Regression test for the header/comment-check-order bug: before the
    fix, this returned ([], []) for spec.md's own worked example."""

    def setUp(self):
        self.nodes, self.edges = load_edge_list(fixture("spec-example.txt"))

    def test_all_nodes_parsed(self):
        self.assertEqual(len(self.nodes), 6)
        self.assertEqual(len(self.edges), 4)

    def test_group_suffix_is_stripped_and_typed_correctly(self):
        by_label = {n["label"]: n for n in self.nodes}
        self.assertEqual(by_label["South Asian Languages"]["type"], "group")
        self.assertEqual(by_label["Andhra Pradesh"]["type"], "entity")
        self.assertEqual(by_label["Telugu"]["type"], "entity")

    def test_directed_edge(self):
        edge = next(e for e in self.edges if e["relation"] == "language used" and e["target"] == "Telugu")
        self.assertEqual(edge["source"], "Andhra Pradesh")
        self.assertTrue(edge["directed"])

    def test_bidirectional_edge_is_not_directed(self):
        edge = next(e for e in self.edges if e["relation"] == "diplomatic relation")
        self.assertEqual(edge["source"], "Guatemala")
        self.assertEqual(edge["target"], "European Union")
        self.assertFalse(edge["directed"])

    def test_contains_edge_is_a_plain_directed_edge_here(self):
        # Section 5.2: "contains edges are included like any other edge" in
        # the flat TXT format — this reference loader doesn't know about
        # group-membership semantics at all, that's the app importer's job
        # (Section 5.3). It should just come back as an ordinary edge.
        edge = next(e for e in self.edges if e["relation"] == "contains")
        self.assertEqual(edge["source"], "South Asian Languages")
        self.assertEqual(edge["target"], "Andhra Pradesh")
        self.assertTrue(edge["directed"])


class TestOtherFixtures(unittest.TestCase):
    def test_subset(self):
        nodes, edges = load_edge_list(fixture("subset.txt"))
        self.assertEqual([n["label"] for n in nodes], ["Andhra Pradesh", "Telugu"])
        self.assertEqual(len(edges), 1)
        self.assertEqual(edges[0]["relation"], "language used")

    def test_andhra_as_group(self):
        nodes, edges = load_edge_list(fixture("andhra-as-group.txt"))
        self.assertEqual(nodes, [{"label": "Andhra Pradesh", "type": "group"}])
        self.assertEqual(edges, [])

    def test_additional(self):
        nodes, edges = load_edge_list(fixture("additional.txt"))
        self.assertEqual([n["label"] for n in nodes], ["Andhra Pradesh", "Kerala"])
        self.assertEqual(edges[0]["relation"], "neighboring state")


class TestGrammarEdgeCases(unittest.TestCase):
    def test_comment_lines_and_blank_lines_are_ignored(self):
        nodes, edges = load_text(
            "# this is a comment\n"
            "\n"
            "## NODES\n"
            "# another comment, mid-section\n"
            "Alpha\n"
            "\n"
            "## EDGES\n"
        )
        self.assertEqual(nodes, [{"label": "Alpha", "type": "entity"}])
        self.assertEqual(edges, [])

    def test_headers_are_recognized_even_though_they_start_with_hash(self):
        # The bug this whole file exists to pin down.
        nodes, edges = load_text("## NODES\nAlpha\n\n## EDGES\n")
        self.assertEqual(len(nodes), 1)

    def test_malformed_edge_line_missing_separator_is_skipped(self):
        nodes, edges = load_text(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha Beta no separator at all\nAlpha -> Beta : real\n"
        )
        self.assertEqual(len(edges), 1)
        self.assertEqual(edges[0]["relation"], "real")

    def test_malformed_edge_line_missing_connector_is_skipped(self):
        nodes, edges = load_text(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha Beta : no connector here\nAlpha -> Beta : real\n"
        )
        self.assertEqual(len(edges), 1)
        self.assertEqual(edges[0]["relation"], "real")

    def test_a_bare_group_marker_with_no_name_is_skipped(self):
        nodes, edges = load_text("## NODES\n[group]\nAlpha\n\n## EDGES\n")
        self.assertEqual(nodes, [{"label": "Alpha", "type": "entity"}])

    def test_file_with_no_recognized_sections_returns_empty(self):
        nodes, edges = load_text("just some\nrandom text\nwith no headers at all\n")
        self.assertEqual(nodes, [])
        self.assertEqual(edges, [])

    def test_multiple_edges_between_the_same_pair_with_different_relations(self):
        nodes, edges = load_text(
            "## NODES\nAlpha\nBeta\n\n## EDGES\nAlpha -> Beta : relation one\nAlpha -> Beta : relation two\n"
        )
        self.assertEqual(len(edges), 2)
        self.assertEqual({e["relation"] for e in edges}, {"relation one", "relation two"})


if __name__ == "__main__":
    unittest.main()
